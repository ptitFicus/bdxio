const express = require("express");
const fs = require("fs");
const departements = require("./data");

const app = express();
const port = 3000;

const answers = new Map();

function storeAnswer(data) {
  if (answers.has(data.email)) {
    throw new Error("An answer is already registered for this email");
  }
  answers.set(data.email, data);
}

app.use(express.json());

app.get("/departements", (req, res) => {
  const delay = req.header("x-delay");

  setTimeout(() => res.json(departements), Number(delay) || 0);
});

app.post("/answers", (req, res) => {
  const delay = req.header("x-delay");

  setTimeout(() => {
    try {
      storeAnswer(req.body);
      res.status(201).end();
    } catch (err) {
      res
        .status(400)
        .json({ message: "An answer is already associated with this email !" })
        .end();
    }
  }, delay);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
