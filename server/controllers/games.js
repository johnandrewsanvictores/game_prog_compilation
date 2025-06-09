import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getGames = (req, res) => {
    const filepath = path.join(__dirname, '../data/games.json');

    fs.readFile(filepath, 'utf8', (err, data) => {
        if(err) return res.status(500).json({error: 'Failed to read games list.'});
        const games =  JSON.parse(data);
        res.status(200).json(games);
    })
}

export const getSpecificGame = (req, res) => {
    const filepath = path.join(__dirname, '../data/games.json');
    const gameId = req.params.id;
    fs.readFile(filepath, 'utf8', (err, data) => {
        if(err) return res.status(500).json({error: 'Failed to read games list.'});

        const games = JSON.parse(data);
        if(isNaN(Number(gameId)) || (gameId > (games.length - 1) || gameId < 0)) res.status(400).json({error: 'Invalid game id.'});

        const specificGame = games[gameId];
        res.status(200).json(specificGame);
    })
}