import express from "express"; 
import cors from "cors"; 

const app = express();

app.use(cors());

app.use(express.json()); 

let leaderboard = [];

app.post("/leaderboard", (req, res) => {
  const { name, time } = req.body;
  if (name && typeof time === "number") {
    leaderboard.push({ name, time });
    res.status(201).json({ message: "Score opgeslagen" });
  } else {
    res.status(400).json({ message: "Ongeldige data" });
  }
});

app.get("/leaderboard", (req, res) => {
    // Sorteer de leaderboard op tijd (oplopend)
    const sortedLeaderboard = leaderboard.sort((a, b) => a.time - b.time);

    res.json(sortedLeaderboard.slice(0, 10));
  });
  

const PORT = 3200;
app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});
