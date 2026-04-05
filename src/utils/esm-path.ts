import { dirname } from "path";
import { fileURLToPath } from "url";

export const getESMDirnam = (metaUrl: string) => {
  const fileName = fileURLToPath(metaUrl);
  return dirname(fileName);
};

export const getESMFilename = (metaUrl: string) => {
  return fileURLToPath(metaUrl);
};
