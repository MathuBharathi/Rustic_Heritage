import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import path from 'path';
import { pathToFileURL } from 'url';

dotenv.config();

function apiServerPlugin() {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          const urlPath = req.url.split('?')[0];
          const routeName = urlPath.replace('/api/', '').replace('.js', '');
          const apiFilePath = path.resolve(process.cwd(), `api/${routeName}.js`);

          try {
            let body = {};
            if (req.method === 'POST') {
              const buffers = [];
              for await (const chunk of req) {
                buffers.push(chunk);
              }
              const rawBody = Buffer.concat(buffers).toString();
              try {
                body = JSON.parse(rawBody);
              } catch (e) {
                body = {};
              }
            }

            req.body = body;

            res.status = (code) => {
              res.statusCode = code;
              return res;
            };
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return res;
            };

            const fileUrl = pathToFileURL(apiFilePath).href + `?t=${Date.now()}`;
            const module = await import(fileUrl);
            const handler = module.default;
            if (typeof handler === 'function') {
              return await handler(req, res);
            }
          } catch (err) {
            console.error(`Local API Route Error [${req.url}]:`, err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: err.message || 'API Handler error' }));
          }
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiServerPlugin()],
  server: {
    port: 3000,
  },
});
