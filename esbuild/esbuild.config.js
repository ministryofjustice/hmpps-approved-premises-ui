const { spawn } = require('node:child_process')
const path = require('node:path')

const { glob } = require('glob')
const chokidar = require('chokidar')
const buildAssets = require('./assets.config')
const buildApp = require('./app.config')
const e = require('express')

const cwd = process.cwd()

/**
 * Simple debounce helper
 * @param {Function} fn - The function to debounce
 * @param {number} delay - The delay in ms
 * @returns {Function}
 */
function debounce(fn, delay = 200) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Configuration for build steps
 * @type {BuildConfig}
 */
const buildConfig = {
  isProduction: process.env.NODE_ENV === 'production',

  app: {
    outDir: path.join(cwd, 'dist'),
    entryPoints: glob
      .sync([path.join(cwd, '*.ts'), path.join(cwd, 'server/**/*.ts')])
      .filter(file => !file.endsWith('.test.ts')),
    copy: [
      {
        from: path.join(cwd, 'server/views/**/*'),
        to: path.join(cwd, 'dist/server/views'),
      },
      {
        from: path.join(cwd, 'server/**/*.json'),
        to: path.join(cwd, 'dist/server'),
      },
    ],
  },

  assets: {
    outDir: path.join(cwd, 'dist/assets'),
    entryPoints: glob.sync([path.join(cwd, 'assets/js/index.js'), path.join(cwd, 'assets/scss/application.scss')]),
    copy: [
      {
        from: path.join(cwd, 'assets/images/**/*'),
        to: path.join(cwd, 'dist/assets/images'),
      },
    ],
    clear: glob.sync([path.join(cwd, 'dist/assets/{css,js}')]),
  },
}

const main = () => {
  /**
   * @type {chokidar.WatchOptions}
   */
  const chokidarOptions = {
    persistent: true,
    ignoreInitial: true,
  }

  const args = process.argv
  if (args.includes('--build')) {
    Promise.all([buildApp(buildConfig), buildAssets(buildConfig)]).catch(e => {
      process.stderr.write(`${e}\n`)
      process.exit(1)
    })
  }

  let serverEnv
  if (args.includes('--dev-server')) serverEnv = '.env'
  if (args.includes('--dev-test-server')) serverEnv = 'feature.env'

  if (serverEnv) {
    let serverProcess = null
    chokidar.watch(['dist']).on(
      'all',
      debounce(() => {
        if (serverProcess) serverProcess.kill()
        process.stdout.write(`Restarting server...\n`)
        serverProcess = spawn('node', [`--env-file=${serverEnv}`, 'dist/server.js'], { stdio: 'inherit' })
      }),
    )
  }

  if (args.includes('--watch')) {
    process.stderr.write('\u{1b}[1m\u{1F52D} Watching for changes...\u{1b}[0m\n')
    // Assets
    chokidar.watch(['assets/**/*'], chokidarOptions).on(
      'all',
      debounce(() => buildAssets(buildConfig).catch(e => process.stderr.write(`${e}\n`))),
    )

    // App
    chokidar.watch(['server/**/*'], { ...chokidarOptions, ignored: ['**/*.test.ts'] }).on(
      'all',
      debounce(() => buildApp(buildConfig).catch(e => process.stderr.write(`${e}\n`))),
    )
  }
}

main()
