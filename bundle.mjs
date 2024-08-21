import * as esbuild from 'esbuild';
import * as fs from 'fs/promises';
import * as process from 'process';
import { exec } from 'child_process';

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const isWatchMode = isDevelopment && process.env.WATCH !== undefined;
const isProduction = process.env.NODE_ENV === 'production';

console.log(process.env.WATCH);

const PARTY_BUNDLE = 'party';
const PARTY_API = isDevelopment ? 'http://localhost:3005' : 'https://api.tunage.app'

let ctx = await esbuild.context({
  entryPoints: ['ts/main.ts'],
  bundle: true,
  outfile: `public/assets/javascript/${PARTY_BUNDLE}.js`,
  define: {
    'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
    'process.env.PARTY_API': `'${process.env.PARTY_API ?? PARTY_API}'`
  },
  minify: isProduction,
  sourcemap: isProduction ? false : 'inline',
});

if (isWatchMode) await buildIndex().then(async () => ctx.watch());
else if (isDevelopment) await buildIndex().then(async () => {
  await ctx.rebuild();
  process.exit(0);
});
else await serveSite();

async function buildIndex() {
  await fs.copyFile('index.html', 'public/index.html');
}

async function serveSite() {
  setTimeout(() => exec("open http://localhost:3000"), 500);
  await buildIndex();
  await ctx.serve({
    port: 3000,
    servedir: "public",
    onRequest: async (request) => {
      console.log(request.path);
      if (request.path.endsWith('/index.html')) await buildIndex();
    }
  });
  process.exit(0);
}
