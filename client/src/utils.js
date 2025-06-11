export function displayDialogue(text, onDisplayEnd) {
  const dialogueUI = document.getElementById("textbox-container");
  const dialogue = document.getElementById("dialogue");

  dialogueUI.style.display = "block";

  let index = 0;
  let currentText = "";
  const intervalRef = setInterval(() => {
    if (index < text.length) {
      currentText += text[index];
      dialogue.innerHTML = currentText;
      index++;
      return;
    }

    clearInterval(intervalRef);
  }, 3);

  const closeBtn = document.getElementById("close");

  function onCloseBtnClick() {
    onDisplayEnd();
    dialogueUI.style.display = "none";
    dialogue.innerHTML = "";
    clearInterval(intervalRef);
    closeBtn.removeEventListener("click", onCloseBtnClick);
  }

  closeBtn.addEventListener("click", onCloseBtnClick);
}

export function setCamScale(k) {
  const resizeFactor = k.width() / k.height();
  if (resizeFactor < 1) {
    k.camScale(k.vec2(1));
    return;
  }

  k.camScale(k.vec2(1.5));
}

function typeText(element, text, delay, callback) {
  let index = 0;

  function typeChar() {
    if (index < text.length) {
      const char = text.charAt(index);

      if (char === "<") {
        // Detect and inject full HTML tag
        const endIndex = text.indexOf(">", index);
        const tag = text.slice(index, endIndex + 1);
        element.insertAdjacentHTML("beforeend", tag);
        index = endIndex + 1;
      } else {
        element.insertAdjacentText("beforeend", char);
        index++;
      }

      setTimeout(typeChar, delay);
    } else if (callback) {
      callback();
    }
  }

  typeChar();
}

function displayConsoleText(description, devs) {
  let typingTimeout = null;
  const consoleTextElement = document.querySelector(".consoleText");
  const lines = [
    "> Initializing game data...",
    "<br>",
    "> Loading assets complete",
    "<br>",
    "> Welcome to the ultimate coding adventure!",
    "<br><br>",
    description,
    "<br><br>",
    ">DEVELOPERS:",
    "<br>" + devs,
  ];

  let lineIndex = 0;
  let continueTyping = true;

  consoleTextElement.innerHTML = "";
  function typeNextLine() {
    if (lineIndex < lines.length && continueTyping) {
      typeText(consoleTextElement, lines[lineIndex], 80, () => {
        lineIndex++;
        typingTimeout = setTimeout(typeNextLine, 500);
      });
    }
  }

  typeNextLine();

  function stopTyping() {
    clearTimeout(typingTimeout); // Clear the timeout if we stop typing
    lineIndex = lines.length - 1;
    continueTyping = false;
  }

  return stopTyping;
}

export async function displayGameConsole(gameName, onDisplayEnd) {
  const apiUrl = import.meta.env.VITE_SERVER_URL;
  const closeBtn = document.querySelector(".consoleCloseBtn");
  const consoleWrapper = document.querySelector(".gameConsoleUiWrapper");
  const consoleContainer = document.querySelector(".gameConsoleUiContainer");

  const gameNameEl = document.querySelector(".gameName");
  const engineValueEl = document.getElementById("engine-value");
  const genreValueEl = document.getElementById("genre-value");
  const downloadGameBtnEl = document.querySelector(".downloadGameBtn");

  const video_el = document.getElementById("video-el");

  const controller = new AbortController(); // ← 1. Create controller
  const signal = controller.signal;

  consoleWrapper.style.opacity = "1";
  consoleWrapper.style.zIndex = "1000";
  consoleWrapper.style.transform = "scale(1)";

  consoleContainer.style.opacity = "1";
  consoleContainer.style.transform = "scale(1)";

  try {
    const response = await fetch(
      `${apiUrl}/api/games/${gameName.toLowerCase().replace(" ", "_")}`,
      { signal } // ← 2. Pass the signal to fetch
    );

    const gameInfo = await response.json();

    gameNameEl.textContent = gameInfo.title;
    engineValueEl.textContent = gameInfo.engine;
    genreValueEl.textContent = gameInfo.genre.join(", ");
    downloadGameBtnEl.href = `https://drive.google.com/uc?export=download&id=${gameInfo.gdrive_id}`;
    video_el.src = `${apiUrl}/videos/${gameName
      .toLowerCase()
      .replace(" ", "_")}.mkv`;

    let devs = gameInfo.developers.join("<br>");
    const stopTyping = displayConsoleText(gameInfo.description, devs);

    function onCloseBtnClick() {
      onDisplayEnd();
      stopTyping();

      controller.abort(); // ← 3. Abort the fetch if still in progress

      closeBtn.removeEventListener("click", onCloseBtnClick);

      consoleWrapper.style.opacity = "0";
      consoleWrapper.style.zIndex = "-1";
      consoleWrapper.style.transform = "scale(0)";

      consoleContainer.style.opacity = "0";
      consoleContainer.style.transform = "scale(0)";

      document.querySelector(".consoleText").innerHTML = "";
      gameNameEl.textContent = "";
      engineValueEl.textContent = "";
      genreValueEl.textContent = "";
      downloadGameBtnEl.href = "";
      video_el.src = "";
    }

    closeBtn.addEventListener("click", onCloseBtnClick);
  } catch (err) {
    if (err.name === "AbortError") {
      console.log("Fetch aborted because user closed the console.");
    } else {
      console.error("Fetch error:", err);
    }
  }
}
