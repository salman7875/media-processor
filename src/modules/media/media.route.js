import express from "express";
import { MediaController } from "./media.controller.js";

const router = express.Router();
const controller = new MediaController();

router.get("/", controller.fetchVideo);

export default router;
