const express = require("express");
const fs = require("fs");
const departements = require("./data");

const app = express();
const port = 3000;

app.use(express.json());

app.get("/departements", (req, res) => {
  const delay = req.header("x-delay");

  setTimeout(() => res.json(departements), Number(delay) || 0);
});

app.post("/answers", (req, res) => {
  const delay = req.header("x-delay");
  console.log("body", req.body);
  setTimeout(() => {
    if (req.body.butter === "UNSALTED") {
      res.status(400).json({ message: "Please pick a real butter type" }).end();
    } else {
      res.status(201).end();
    }
  }, Number(delay) || 0);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
