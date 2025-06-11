import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getVideoPath = (req, res) => {
  const filepath = path.join(
    __dirname,
    "../private/videos",
    req.params.filename
  );

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: "Video not found" });
  }

  const referrer = req.get("Referrer") || "";
  const isFromMySite = referrer.includes(process.env.FRONTEND_URL);

  if (!isFromMySite) {
    return res.status(403).send("Forbidden");
  }

  res.sendFile(filepath);
};
