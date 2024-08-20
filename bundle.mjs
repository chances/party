import * as esbuild from 'esbuild';
import * as process from 'process';
import { exec } from 'child_process';

process.env.NODE_ENV = process.env.NODE_ENV || 'production'
const isDevelopment = process.env.NODE_ENV === 'development'
const isWatchMode = isDevelopment && process.env.WATCH !== undefined
const isProduction = process.env.NODE_ENV === 'production'

console.log(process.env.WATCH);

const PARTY_BUNDLE = 'party';
const PARTY_API = isDevelopment ? 'http://localhost:3005' : 'https://api.tunage.app'

let ctx = await esbuild.context({
  entryPoints: ['ts/main.ts'],
  bundle: true,
  outfile: 'public/assets/javascript/party.js',
  define: {
    'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
    'process.env.PARTY_API': `'${process.env.PARTY_API || PARTY_API}'`
  },
  minify: isProduction,
});

if (isWatchMode) await ctx.watch();
else if (isDevelopment) await ctx.rebuild();
else await serveSite();
process.exit(0);

async function serveSite() {
  setTimeout(() => exec("open http://localhost:3000"), 500);
  await ctx.serve({
    port: 3000,
    servedir: "public",
  });
}
