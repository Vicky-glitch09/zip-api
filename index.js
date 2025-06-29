const express = require("express");
const archiver = require("archiver");
const fetch = require("node-fetch"); // make sure this is installed
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());

app.post("/download", async (req, res) => {
  const fileUrls = req.body.urls;

  if (!fileUrls || !Array.isArray(fileUrls)) {
    return res.status(400).send("Invalid 'urls' array");
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", "attachment; filename=files.zip");

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(res);

  for (let i = 0; i < fileUrls.length; i++) {
    try {
      const response = await fetch(fileUrls[i]);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      archive.append(buffer, { name: `file${i + 1}${getExtension(fileUrls[i])}` });
    } catch (e) {
      console.log("Failed to fetch: " + fileUrls[i]);
    }
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
