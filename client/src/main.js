import { k } from "./kaboomCtx.js";
import { dialogueData, scaleFactor } from "./constants.js";
import { displayDialogue, displayGameConsole, setCamScale } from "./utils.js";

let frog = null;
let bgmStarted = false;
let bgMusic = null;
function startBgmOnce() {
  if (!bgmStarted) {
    bgMusic = k.play("bgm", {
      loop: true,
      volume: 0.5,
    });
    bgmStarted = true;
  }
}

k.loadSprite("spritesheet", "./spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 780, //character down id in tiled editor
    "walk-down": { from: 780, to: 781, loo: true, speed: 8 },
    "idle-side": 782, //character side id in tiled editor
    "walk-side": { from: 782, to: 783, loo: true, speed: 8 },
    "idle-up": 819, //character up id in tiled editor
    "walk-up": { from: 819, to: 820, loo: true, speed: 8 },
  },
});

k.loadSprite("frogsheet", "./spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 827, //character down id in tiled editor
    "walk-down": { from: 827, to: 828, loop: true, speed: 2 },
  },
});

k.loadSprite("map", "./map.png");

k.loadSound("jump", "./sound/Bounce.wav");
k.loadSound("dialogOpen", "./sound/OpenDialog.wav");
k.loadSound("bgm", "./sound/Bg.ogg");
k.loadSound("console", "./sound/console.ogg");

k.loadSound("benMusic", "./sound/music.mp3");

k.setBackground(k.Color.fromHex("#311047"));

k.scene("main", async () => {
  const mapData = await (await fetch("./map.json")).json();
  const layers = mapData.layers;

  const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);

  const player = k.make([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10),
    }),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactor),
    {
      speed: 250,
      direction: "down",
      isInDialogue: true,
    },
    "player",
  ]);

  for (const layer of layers) {
    if (layer.name === "boundaries") {
      displayDialogue(
        "<strong>Welcome to Tapverse: A BSCS Game Dimension</strong>. <br>Controls:Tap/Click around to move.Approach the object or entity to enable interaction.",
        () => {
          player.isInDialogue = false;
        }
      );
      for (const boundary of layer.objects) {
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);

        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            player.isInDialogue = true;
            k.play("dialogOpen", {
              volume: 0.8,
              loo: false,
            });
            bgMusic.stop();

            if (boundary.name === "music") {
              const benPlay = k.play("benMusic", {
                volume: 1,
                speed: 1,
              });

              let isVibing = true;

              frog = k.add([
                k.sprite("frogsheet", { anim: "walk-down" }),
                k.area({ shape: new k.Rect(k.vec2(0, 3), 10, 10) }),
                k.body(),
                k.anchor("center"),
                k.pos(player.pos.add(60, 0)), // place next to player
                k.scale(scaleFactor),
                "frog",
              ]);

              // Play music dialogue
              displayDialogue("Listening...", () => {
                player.isInDialogue = false;
                bgMusic.play();
                benPlay.stop();
                isVibing = false;

                if (frog) {
                  k.destroy(frog);
                  frog = null;
                }
              });

              player.play("walk-down");
              frog.play("walk-down");

              k.loop(0.75, () => {
                if (!isVibing) return;
                player.play("walk-down");
                frog.play("walk-down");
              });
            } else {
              console.log(boundary.name);
              if (
                [
                  "dead_pixel",
                  "dinoten",
                  "pastel.season.love",
                  "klikc",
                  "nicko_coin",
                  "enkentadia",
                ].includes(boundary.name.toLowerCase().replace(" ", "_"))
              ) {
                const consolePlay = k.play("console", {
                  volume: 0.5,
                  speed: 1,
                  loop: true,
                });
                displayGameConsole(boundary.name, () => {
                  player.isInDialogue = false;
                  bgMusic.play();
                  consolePlay.stop();
                });
              } else {
                displayDialogue(dialogueData[boundary.name], () => {
                  player.isInDialogue = false;
                  bgMusic.play();
                });
              }
            }
          });
        }
      }
      continue;
    }

    if (layer.name === "spawnpoints") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          k.add(player);
          continue;
        }
      }
    }
  }

  setCamScale(k);

  k.onResize(() => {
    //resize the game and camera like zooming
    setCamScale(k);
  });

  k.onUpdate(() => {
    k.camPos(player.pos.x, player.pos.y + 100);
  });

  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;
    startBgmOnce();

    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);

    const mouseAngle = player.pos.angle(worldMousePos);
    const lowerBound = 50;
    const upperBound = 125;

    if (
      mouseAngle > lowerBound &&
      mouseAngle < upperBound &&
      player.curAnim() !== "walk-up"
    ) {
      player.play("walk-up");
      player.direction = "up";
      return;
    }

    if (
      mouseAngle < -lowerBound &&
      mouseAngle > -upperBound &&
      player.curAnim() !== "walk-down"
    ) {
      player.play("walk-down");
      player.direction = "down";
      return;
    }

    if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      return;
    }

    if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      return;
    }
  });
});

k.go("main");
