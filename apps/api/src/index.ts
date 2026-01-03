import express from "express";
import path from "path";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/contexts/roadwork.jsonld", (_req, res) => {
  const contextPath = "/domains/roadwork/context.jsonld";
  res.setHeader("Content-Type", "application/ld+json");
  res.sendFile(contextPath);
});


app.listen(port, "0.0.0.0", () => {
  console.log(`API listening on http://0.0.0.0:${port}`);
});

