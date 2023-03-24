/* eslint-disable import/no-import-module-exports */
import path from 'path'
import { rmSync } from 'fs'

module.exports = async () => {
  const tmpDir = path.join(__dirname, '..', '..', 'tmp')
  rmSync(tmpDir, { recursive: true, force: true })
}
