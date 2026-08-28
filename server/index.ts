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

const MAX_DELAY_MS = 10_000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

app.use("/api/avatars", express.static(avatarsDir, { maxAge: "1h" }));

app.get("/api/clients", async (req, res) => {
  const delay = Number(req.query.delay);
  const requested =
    Number.isFinite(delay) && delay >= 0 ? delay : Number(DELAY_MS);
  await wait(Math.min(requested, MAX_DELAY_MS));

  const fail = req.query.fail;
  const status = fail === "1" ? 500 : Number(fail);

  if (Number.isInteger(status) && status >= 400 && status <= 599) {
    res.status(status).json({ error: "Failed to load client data." });
    return;
  }

  if (Math.random() < FAIL_RATE) {
    res.status(500).json({ error: "Failed to load client data." });
    return;
  }

  res.json(company);
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
