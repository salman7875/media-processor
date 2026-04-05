import { ChildProcess, spawn } from "child_process";
import os from "os";

const MAX_PROCESSES = os.cpus().length;
let currentProcesses = 0;

export const spawnProcess = (args: any[]): Promise<ChildProcess | null> => {
  return new Promise((resolve, reject) => {
    if (currentProcesses >= MAX_PROCESSES) {
      return reject(
        new Error(
          "Maximum number of processes reached. Please try again later.",
        ),
      );
    }

    currentProcesses++;

    try {
      const proc = spawn("yt-dlp", args);

      proc.on("close", () => {
        currentProcesses--;
      });

      proc.on("error", (error) => {
        currentProcesses--;
        reject(error);
      });

      return resolve(proc);
    } catch (error) {
      currentProcesses--;
      return reject(error);
    }
  });
};
