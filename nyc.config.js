const packageJson = require('./package.json')

const coverageThreshold = packageJson.jest.coverageThreshold.global

module.exports = {
  ...coverageThreshold,
}
