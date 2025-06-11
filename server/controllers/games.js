import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getGames = (req, res) => {
  const filepath = path.join(__dirname, "../data/games.json");

  fs.readFile(filepath, "utf8", (err, data) => {
    if (err)
      return res.status(500).json({ error: "Failed to read games list." });
    const games = JSON.parse(data);
    res.status(200).json(games);
  });
};

export const getSpecificGame = (req, res) => {
  const filepath = path.join(__dirname, "../data/games.json");
  const gameId = req.params.id;
  fs.readFile(filepath, "utf8", (err, data) => {
    if (err)
      return res.status(500).json({ error: "Failed to read games list." });

    const game = JSON.parse(data).find(
      (g) =>
        g.title.toLowerCase().replace(" ", "_") ===
        gameId.toLowerCase().replace(" ", "_")
    );
    if (!game) res.status(404).json({ error: "Not found" });
    res.status(200).json(game);
  });
};
