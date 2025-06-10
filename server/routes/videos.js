import express from 'express'
import {getVideoPath} from "../controllers/videos.js";

const router = express.Router();

router.get('/:filename', getVideoPath);

export default router;