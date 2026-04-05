import path from "node:path";
import { type Response, type Request } from "express";

import { getESMDirnam } from "../../utils/esm-path.js";
import { spawnProcess } from "../../utils/spawn-process.js";

export class MediaController {
  async fetchVideo(req: Request, res: Response) {
    const q = req.query.q;
    const __dirname = getESMDirnam(import.meta.url);
    const outputDir = path.join(__dirname, "..", "..", "..", "segments");

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

    if (segment) {
      segment.stdout?.on("data", (data) => console.log(`Segment 1: ${data}`));
      segment.stderr?.on("data", (data) =>
        console.error(`Segment 1 Error: ${data}`),
      );
      segment.on("exit", (code) =>
        console.log(`Segment 1 done (code ${code})`),
      );
    }

    res.status(200).json({ success: true, message: "Video is downloading!" });
  }
}
