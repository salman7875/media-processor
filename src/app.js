import express from "express";
import path from "path";
import { getESMDirnam } from "./utils/esm-path.js";
import mediaRoutes from "./modules/media/media.route.js";

const app = express();

const __dirname = getESMDirnam(import.meta.url);
const outputDir = path.join(__dirname, "..", "segments");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

app.use("/public", express.static(path.join(__dirname + "./../public")));
app.use("/media", mediaRoutes);

export default app;
