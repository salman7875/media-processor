import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { EventEmitter } from "events";
import { spawnProcess } from "./utils/spawn-process";

const event = new EventEmitter();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputDir = path.join(__dirname, "segments");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
app.use("/public", express.static(path.join(__dirname + "./../public")));

app.get("/s", (req, res) => {
  res.send(
    `<a href=http://localhost:3000/public/image1.jpg download>Click to download</a>`,
  );
});

app.get("/", async (req, res) => {
  const q = req.query.q;

  if (!q) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide youtube link!" });
  }

  const file1 = path.join(
    outputDir,
    `segment_part${Math.floor(Math.random() * 10)}.%(ext)s`,
  );

  const segment = await spawnProcess([
    "-o",
    file1,
    "-S",
    "res:1080",
    "--download-sections",
    "*00:00:00.00-00:00:00.00",
    "--force-keyframes-at-cuts",
    q,
  ]);
  segment.stdout.on("data", (data) => console.log(`Segment 1: ${data}`));
  segment.stderr.on("data", (data) =>
    console.error(`Segment 1 Error: ${data}`),
  );
  segment.on("exit", (code) => console.log(`Segment 1 done (code ${code})`));

  res
    .status(200)
    .send(
      `<a href=http://localhost:3000/public/${"30 SECOND TIMER.webm"} download>Click to download</a>`,
    );
});

event.on("FINISH", (e) => {
  console.log(e);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
