// src/app.js

const express = require("express");
const cors = require("cors"); // <-- 1. Import the cors package
const path = require("path");
const mainRouter = require("./routes");

const app = express();

// Middlewares
app.use(cors()); // <-- 2. Add the cors middleware HERE, before your routes.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the blind-signatures library
app.get("/lib/blind-signatures.js", (req, res) => {
  const libPath = path.join(
    __dirname,
    "../node_modules/blind-signatures/dist/rsablind.js"
  );
  res.sendFile(libPath);
});

// Main API Router
app.use("/api", mainRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

module.exports = app;
