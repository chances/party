const {
  FuseBox,
  ReplacePlugin,
  UglifyJSPlugin,
  WebIndexPlugin
} = require('fuse-box')

process.env.NODE_ENV = process.env.NODE_ENV || 'production'
const isDevelopment = process.env.NODE_ENV === 'development'
const isWatchMode = isDevelopment && process.env.WATCH !== undefined
const isProduction = process.env.NODE_ENV === 'production'

const fuse = FuseBox.init({
  homeDir: "ts",
  output: "./public/assets/javascript/$name.js",
  debug: isDevelopment,
  cache: !isProduction,
  plugins: [
    WebIndexPlugin({
      template: 'index.html',
      path: '/assets/javascript/',
      target: '../../index.html',
    })
  ]
})

if (isWatchMode) {
  fuse.dev({
    root: './public',
    port: 3000,
    open: 'http://localhost:3000/'
  })
}

const PARTY_BUNDLE = 'party';
const PARTY_API = isDevelopment ? 'http://localhost:3005' : 'https://api.tunage.app'

const app = fuse
  .bundle(PARTY_BUNDLE)
  .instructions("> main.ts")
  .plugin(ReplacePlugin({
    'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
    'process.env.PARTY_API': `'${process.env.PARTY_API || PARTY_API}'`
  }))

if (isProduction) {
  app.plugin(UglifyJSPlugin())
}

if (isWatchMode) {
  app
    .hmr({reload : true})
    .watch('ts/**')
}

fuse.run()
