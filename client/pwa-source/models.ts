export interface IconJob {
  // File name of the approved master in pwa-source/masters/.
  master: string;
  // Where the PNG lands, as a path under public/ (and so as a URL).
  outputPath: string;
  size: number;
}
