import { dirname } from "path";
import { fileURLToPath } from "url";

export const getESMDirnam = (metaUrl) => {
  const fileName = fileURLToPath(metaUrl);
  return dirname(fileName);
};

export const getESMFilename = (metaUrl) => {
  return fileURLToPath(metaUrl);
};
