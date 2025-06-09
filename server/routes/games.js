import express from 'express'
import { getGames, getSpecificGame } from "../controllers/games.js";

const router = express.Router();

router.get('/', getGames);
router.get('/:id', getSpecificGame);

export default router;