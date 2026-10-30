import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

// Playwright records WebM; the delivered player uses H.264 MP4.
const source = "docs/game-artist/motion/research-session.webm";
const destination = "docs/game-artist/motion/research-session.mp4";
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const sourceManifest = JSON.parse(
  await readFile("docs/game-artist/motion/manifest.json", "utf8"),
);
const sourceHash = digest(await readFile(source));
if (sourceManifest.sha256 !== sourceHash)
  throw new Error(
    "Source recording differs from its manifest; record and validate the source first.",
  );
execFileSync(
  process.env.FFMPEG_PATH || "ffmpeg",
  [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    source,
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "18",
    "-pix_fmt",
    "yuv420p",
    "-an",
    "-movflags",
    "+faststart",
    destination,
  ],
  { stdio: "inherit" },
);
const probe = JSON.parse(
  execFileSync(
    process.env.FFPROBE_PATH || "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "stream=codec_name,profile,width,height,pix_fmt,avg_frame_rate,nb_frames:format=duration,size,format_name",
      "-of",
      "json",
      destination,
    ],
    { encoding: "utf8" },
  ),
);
const stream = probe.streams.find((s) => s.codec_name === "h264");
if (!stream || stream.pix_fmt !== "yuv420p")
  throw new Error("Expected H.264/yuv420p output.");
const bytes = await readFile(destination);
const boxes = [];
for (let offset = 0; offset + 8 <= bytes.length; ) {
  const size = bytes.readUInt32BE(offset);
  const kind = bytes.toString("ascii", offset + 4, offset + 8);
  boxes.push({ kind, offset });
  if (size < 8) break;
  offset += size;
}
const fastStart =
  boxes.find((b) => b.kind === "moov")?.offset <
  boxes.find((b) => b.kind === "mdat")?.offset;
if (!fastStart) throw new Error("MP4 metadata must precede media data.");
const manifest = {
  buildId: sourceManifest.buildId,
  path: destination,
  sha256: digest(bytes),
  source: { path: source, sha256: sourceHash },
  codec: stream.codec_name,
  profile: stream.profile,
  pixelFormat: stream.pix_fmt,
  width: stream.width,
  height: stream.height,
  frameRate: stream.avg_frame_rate,
  frames: Number(stream.nb_frames),
  durationSeconds: Number(probe.format.duration),
  bytes: Number(probe.format.size),
  fastStart,
  audio: false,
};
await writeFile(
  "docs/game-artist/motion/mp4-manifest.json",
  JSON.stringify(manifest, null, 2),
);
console.log(JSON.stringify(manifest));
