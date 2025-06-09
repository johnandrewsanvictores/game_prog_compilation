import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getStudents = (req, res) => {
    const filepath = path.join(__dirname, '../data/students.json');

    fs.readFile(filepath, 'utf8', (err, data) => {
        if(err) return res.status(500).json({error: 'Failed to read students list.'});

        let students = null;
        students =  JSON.parse(data);

        if(req.query.gameName) {
            students = JSON.parse(data).filter(student => student['game_name'].toLowerCase().replace(' ', '_') === req.query.gameName);
        }
        res.status(200).json(students.sort((a, b) => a.name.localeCompare(b.name)));
    });
}