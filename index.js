const express = require("express");
const archiver = require("archiver");
const app = express();
const port = process.env.PORT || 10000;

app.get("/download", async (req, res) => {
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", "attachment; filename=files.zip");

  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  archive.pipe(res);

  // Replace with your actual file URLs or data
  const fileUrls = [
    "https://upload.wikimedia.org/wikipedia/commons/a/a7/Blank_image.jpg",
    "https://www.africau.edu/images/default/sample.pdf"
  ];

  for (let i = 0; i < fileUrls.length; i++) {
    const response = await fetch(fileUrls[i]);
    const buffer = await response.buffer();
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
