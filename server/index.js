import express from "express";
import studentRoutes from "./routes/students.js";
import gameRoutes from "./routes/games.js";
import videoRoutes from "./routes/videos.js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

//middlewares
app.use(express.json());
app.use(cors());
app.use(
  "/images",
  express.static(path.join(__dirname, "public/images/students"))
);

app.use("/api/students", studentRoutes);
app.use("/api/games", gameRoutes);
app.use("/videos", videoRoutes);

app.listen(8800, () => {
  console.log("Hello World!");
});
