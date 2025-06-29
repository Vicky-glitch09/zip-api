const express = require("express");
const archiver = require("archiver");
const fetch = require("node-fetch"); // If not using Node 18+

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json()); // Needed to parse JSON body

app.post("/download", async (req, res) => {
  const fileUrls = req.body.urls;

  if (!fileUrls || !Array.isArray(fileUrls) || fileUrls.length === 0) {
    return res.status(400).send("No URLs provided.");
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", "attachment; filename=files.zip");

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(res);

  for (let i = 0; i < fileUrls.length; i++) {
    const response = await fetch(fileUrls[i]);
    const buffer = Buffer.from(await response.arrayBuffer());
    archive.append(buffer, { name: `file${i + 1}${getExtension(fileUrls[i])}` });
  }

  archive.finalize();
});

function getExtension(url) {
  const parts = url.split(".");
  return "." + parts[parts.length - 1].split("?")[0];
}

app.listen(port, () => {
  console.log(`✅ ZIP API running on port ${port}`);
});
