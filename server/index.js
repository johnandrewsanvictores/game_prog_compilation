import express from 'express';
import studentRoutes from './routes/students.js';
import gameRoutes from './routes/games.js';
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname =  path.dirname(__filename);

const app = express();

//middlewares
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'public/images/students')));


app.use("/api/students", studentRoutes);
app.use("/api/games", gameRoutes);

app.listen(8800, () => {
    console.log("Hello World!");
});
