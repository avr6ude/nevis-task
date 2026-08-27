import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import express from "express";

const dataPath = fileURLToPath(
  new URL("../src/data/company.json", import.meta.url),
);
const avatarsDir = fileURLToPath(new URL("./avatars/", import.meta.url));

const company: unknown = JSON.parse(readFileSync(dataPath, "utf-8"));

const app = express();

const PORT = Number(process.env.PORT ?? 8787);
const DELAY_MS = Number(process.env.DELAY_MS ?? 500);
const FAIL_RATE = Number(process.env.FAIL_RATE ?? 0);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

app.use("/api/avatars", express.static(avatarsDir, { maxAge: "1h" }));

app.get("/api/clients", async (req, res) => {
  await wait(DELAY_MS);

  const forced = req.query.fail === "1";
  if (forced || Math.random() < FAIL_RATE) {
    res.status(500).json({ error: "Failed to load client data." });
    return;
  }

  res.json(company);
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
