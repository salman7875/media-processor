import path from "node:path";
import { type Response, type Request } from "express";

import { getESMDirnam } from "../../utils/esm-path.js";
import { spawnProcess } from "../../utils/spawn-process.js";
import { spawn } from "node:child_process";

const AUDIO_SPEEDS = {
  "1/4": "atempo=2.0,atempo=2.0",
  "1/3": "atempo=1.5,atempo=2.0",
  "1/2": "atempo=1.5",
  "1": "atempo=1.0",
};

async function processVideoInBackground(
  url: string,
  speed?: "1/4" | "1/3" | "1/2" | "1",
  id?: string,
) {
  const __dirname = getESMDirnam(import.meta.url);
  const outputDir = path.join(__dirname, "..", "..", "..", "segments");

  const file = path.join(outputDir, `segment_part${id}.%(ext)s`);

  await new Promise<string>(async (resolve, reject) => {
    const dl = await spawnProcess([
      "-o",
      file,
      "-S",
      "res:1080",
      "--download-sections",
      "*00:00:00.00-00:00:00.00",
      "--force-keyframes-at-cuts",
      url,
    ]);

    dl?.on("exit", (code) => {
      if (code === 0) {
        resolve(file);
      } else {
        reject(new Error(`Segment download failed with code ${code}`));
      }
    });
  });

  if (speed && speed !== "1") {
    const finalFile = `${file.replace(".%(ext)s", "")}_speed_${speed.replace("/", "_")}.webm`;

    const inputFile = file.replace("%(ext)s", "webm");
    console.log(
      "file info: ",
      finalFile,
      `${file.replace(".%(ext)s", "")}_speed_${speed.replace("/", "_")}.webm}`,
    );

    await new Promise<void>((resolve, reject) => {
      const args = [
        "-i",
        inputFile,
        "-vf",
        `setpts=${speed}*PTS`,
        "-af",
        AUDIO_SPEEDS[speed],
        finalFile,
      ];
      const seg = spawn("ffmpeg", args);

      seg.stdout?.on("data", (data) => console.log(`Speed Change: ${data}`));
      seg.stderr?.on("data", (data) =>
        console.error(`Speed Change Error: ${data}`),
      );
      seg.on("exit", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Speed change failed with code ${code}`));
        }
      });
    });
  }

  console.log(`Processing of video ${id} completed!`);
}

async function fetchVideo(req: Request, res: Response) {
  const { q, speed } = req.query as {
    q: string;
    speed?: "1/4" | "1/3" | "1/2" | "1";
  };

  if (!q) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide youtube link!" });
  }

  processVideoInBackground(q, speed, Math.floor(Math.random() * 10).toString());

  res.status(200).json({ success: true, message: "Video is downloading!" });
}

export const MediaController = {
  fetchVideo,
};
