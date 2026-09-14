import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import path from 'node:path';
import fs from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import vercel from './vercel.json' with { type: 'json' };

/**
 * Runs the files in /api during `npm run dev`, the same way Vercel does in production,
 * so the whole site (including donations and the contact form) works locally without extra tools.
 */
function vercelApiDev(): Plugin {
  const apiRoot = path.resolve(__dirname, 'api');

  async function handle(server: ViteDevServer, req: IncomingMessage, res: ServerResponse) {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    const route = url.pathname.replace(/^\/api\/?/, '');
    const file = path.join(apiRoot, `${route}.ts`);

    if (!route || route.split('/').some((part) => part.startsWith('_') || part === '..') || !fs.existsSync(file)) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }

    const mod = await server.ssrLoadModule(file);
    const handler = mod[req.method ?? 'GET'];
    if (typeof handler !== 'function') {
      res.statusCode = 405;
      res.end('Method not allowed');
      return;
    }

    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') headers.set(key, value);
      else if (Array.isArray(value)) headers.set(key, value.join(', '));
    }
    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
    const response: Response = await handler(
      new Request(url, { method: req.method, headers, body: hasBody ? Buffer.concat(chunks) : undefined }),
    );

    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(Buffer.from(await response.arrayBuffer()));
  }

  return {
    name: 'vercel-api-dev',
    configureServer(server) {
      server.middlewares.use('/api', (req, res) => {
        req.url = `/api${req.url}`;
        handle(server, req, res).catch((error) => {
          server.config.logger.error(String(error?.stack ?? error));
          res.statusCode = 500;
          res.end('Internal error');
        });
      });
    },
  };
}

// Mirror production security headers in `vite preview` so CSP problems show up before deploying.
const previewHeaders = Object.fromEntries(
  vercel.headers
    .find((rule) => rule.source === '/(.*)')!
    .headers.filter((h) => h.key !== 'Strict-Transport-Security')
    .map((h) => [h.key, h.value.replace('; upgrade-insecure-requests', '')]),
);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const [key, value] of Object.entries(env)) process.env[key] ??= value;

  return {
    plugins: [react(), tailwindcss(), vercelApiDev()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    build: {
      target: 'es2022',
      sourcemap: false,
      // Never inline assets as data: URIs, so the strict Content-Security-Policy can stay strict.
      assetsInlineLimit: 0,
    },
    preview: {
      headers: previewHeaders,
    },
  };
});
