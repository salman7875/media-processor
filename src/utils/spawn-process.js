import { spawn } from "child_process";
import os from "os";

const MAX_PROCESSES = os.cpus().length;
let currentProcesses = 0;

export const spawnProcess = (args) => {
  return new Promise((resolve, reject) => {
    if (currentProcesses < MAX_PROCESSES) {
      currentProcesses++;
      const proc = spawn("yt-dlp", args);
      resolve(proc);
    }
  });
};
