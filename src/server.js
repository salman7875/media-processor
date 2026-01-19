import express from "express";
import { spawn } from "child_process";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import os from "os";
import { EventEmitter } from "events";

const event = new EventEmitter();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputDir = path.join(__dirname, "segments");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
app.use("/public", express.static(path.join(__dirname + "./../public")));

const MAX_PROCESSES = os.cpus().length;
let currentProcesses = 0;
const processQueue = [];

const generateProcess = (args) => {
  return new Promise((resolve, reject) => {
    if (currentProcesses < MAX_PROCESSES) {
      currentProcesses++;
      const proc = spawn("yt-dlp", args);
      resolve(proc);
    }
  });
};

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
  // const segment1 = spawn("yt-dlp", [
  //   "-o",
  //   file1,
  //   "-S",
  //   "res:1080",
  //   "--download-sections",
  //   "*00:00:00.00-00:00:00.00",
  //   "--force-keyframes-at-cuts",
  //   q,
  // ]);

  // segment1.stdout.on("data", (data) => console.log(`Segment 1: ${data}`));
  // segment1.stderr.on("data", (data) =>
  //   console.error(`Segment 1 Error: ${data}`),
  // );
  // segment1.on("exit", (code) => console.log(`Segment 1 done (code ${code})`));

  const segment = await generateProcess([
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
