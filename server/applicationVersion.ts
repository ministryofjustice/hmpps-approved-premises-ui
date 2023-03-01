// eslint-disable import/no-unresolved,global-require
/* istanbul ignore file */

import fs from 'fs'
import path from 'path'

const buildInfoPath = path.resolve(__dirname, '../build-info.json')

const packageData = JSON.parse(fs.readFileSync('./package.json').toString())
const { buildNumber, gitRef } = fs.existsSync(buildInfoPath)
  ? JSON.parse(fs.readFileSync('../build-info.json').toString())
  : {
      buildNumber: packageData.version,
      gitRef: 'unknown',
    }

export default { buildNumber, gitRef, packageData }
