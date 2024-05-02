const express = require("express");
const fs = require("fs");
const app = express();

let chunks = []; // Mảng lưu trữ các chunk đã nhận được
const CHUNK_SIZE = 10 ** 6;
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/video", function (req, res) {
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Range header");
    }
    const videoPath = "bigbuck.mp4"; // Đúng tên file
    const videoSize = fs.statSync("bigbuck.mp4").size;

    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4"
    };
    res.writeHead(206, headers);
    console.log(chunks);
    if (chunks[start]) { // Nếu chunk đã tồn tại trong mảng
        res.end(chunks[start]); // Gửi chunk từ mảng
    } else {
        const videoStream = fs.createReadStream(videoPath, { start, end });
        videoStream.on('data', (chunk) => {
            chunks[start] = chunk; // Lưu chunk vào mảng
            res.write(chunk); // Gửi chunk về client
        });
        videoStream.on('end', () => {
            res.end(); // Kết thúc response khi videoStream kết thúc
        });
    }
});

app.listen(8000, function () {
    console.log("Listening on port 8000");
});
