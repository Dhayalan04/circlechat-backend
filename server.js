const express = require("express");

const app = express();

const PORT = 4000;

app.get("/", (req, res) => {
    res.send("Server is running successfully !");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});