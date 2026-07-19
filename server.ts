import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Import the single consolidated API router
import apiHandler from "./api/index";

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Static assets mapping for local dev
  app.use("/assets", express.static(path.join(process.cwd(), "public/assets")));

  // Delegate all API routes to the consolidated handler
  app.all("/api*", (req, res) => {
    return apiHandler(req, res);
  });

  // Serve Frontend / Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`YOKAIO Launchpad Server running beautiful local preview on http://localhost:${PORT}`);
  });
}

startServer();
