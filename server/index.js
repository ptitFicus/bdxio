const express = require("express");
const fs = require("fs");

const app = express();
const port = 3000;

app.use(express.json());

app.get("/butters", (req, res) => {
  const delay = req.header("x-delay");
  const dpt = req.query.departement;
  console.log("dpt", dpt);
  setTimeout(() => {
    if (["56", "29", "35", "22"].includes(dpt)) {
      res.json([
        { id: "UNSALTED", name: "Beurre doux" },
        { id: "SALTED", name: "Beurre salé" },
        { id: "SEMI_SALTED", name: "Beurre demi-sel" },
      ]);
    } else {
      res.json([
        { id: "UNSALTED", name: "Beurre doux" },
        { id: "SEMI_SALTED", name: "Beurre demi-sel" },
      ]);
    }
  }, Number(delay) || 0);
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
