import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();
  
  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so parent server
  // can take control
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });

  // Parse JSON bodies (Vercel does this automatically)
  app.use(express.json());

  // API Routes (Simulating Vercel Serverless Functions)
  
  // 1. /api/create
  app.all('/api/create', async (req, res) => {
    try {
      // Dynamic import to support hot reloading of API code in dev (if we cleared cache, but here simply importing)
      const handler = (await import('./api/create.js')).default;
      await handler(req, res);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e.message);
    }
  });

  // 2. /api/game/:id
  app.all('/api/game/:id', async (req, res) => {
    try {
      // Create a Vercel-compatible request object with merged query params
      // We cannot mutate req.query directly as it might be read-only in some environments
      const vercelReq = Object.create(req);
      Object.defineProperty(vercelReq, 'query', {
        value: { ...req.query, ...req.params },
        writable: true,
        enumerable: true,
        configurable: true
      });

      const handler = (await import('./api/game/[id].js')).default;
      await handler(vercelReq, res);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e.message); // fixed e.message
    }
  });

  // Use vite's connect instance as middleware. If you use your own
  // express router (express.Router()), you should use router.use
  app.use(vite.middlewares);

  // Serve index.html for all other routes (SPA fallback)
  app.use(async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // 1. Read index.html
      let template = fs.readFileSync(
        path.resolve(__dirname, 'index.html'),
        'utf-8'
      );

      // 2. Apply Vite HTML transforms. This injects the Vite HMR client,
      //    and also applies HTML transforms from Vite plugins, e.g. global preambles
      //    from @vitejs/plugin-react
      template = await vite.transformIndexHtml(url, template);

      // 3. Send the rendered HTML back.
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      // If an error is caught, let Vite fix the stack trace so it maps back
      // to your actual source code.
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Development server running at http://localhost:${port}`);
    console.log(`API routes active at /api/*`);
  });
}

createServer();
