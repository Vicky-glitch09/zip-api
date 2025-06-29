const express = require("express");
const archiver = require("archiver");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.post("/zip", async (req, res) => {
  const urls = req.body.urls;
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).send("Provide an array of URLs in the 'urls' field");
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", "attachment; filename=files.zip");

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.on("error", err => res.status(500).send({ error: err.message }));
  archive.pipe(res);

  for (let i = 0; i < urls.length; i++) {
    try {
      const response = await axios.get(urls[i], { responseType: "arraybuffer" });
      const ext = path.extname(urls[i]) || ".bin";
      archive.append(response.data, { name: `file${i + 1}${ext}` });
    } catch (e) {
      console.error(`Error downloading ${urls[i]}:`, e.message);
    }
  }

  archive.finalize();
});

app.listen(PORT, () => {
  console.log(`✅ ZIP API running on port ${PORT}`);
});
