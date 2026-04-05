export const YT_DLP_CMD = {
  output: "-o",
  format: "-f",
  downloadSections: "--download-sections",
  forceKeyframesAtCuts: "--force-keyframes-at-cuts",
  sortByResolution: (res = 1080) => `-S res:${res}`,
  time: (start: string, end: string) => `*${start}-${end}`,
};
