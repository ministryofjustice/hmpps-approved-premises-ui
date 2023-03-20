/* eslint-disable @typescript-eslint/no-namespace */
import { execSync } from 'child_process'

export {}

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchStringIgnoringWhitespace(expected: string): R
      toMatchOpenAPISpec(): R
    }
  }
}

expect.extend({
  toMatchStringIgnoringWhitespace(received, expected) {
    const pass = received.replace(/\s+/g, ``) === expected.replace(/\s+/g, ``)

    return {
      pass,
      message: pass
        ? () => `expected ${received} not to match ${expected}`
        : () => `expected ${received} to match ${expected}`,
    }
  },
  toMatchOpenAPISpec(pactPath) {
    const openAPIUrl =
      'https://raw.githubusercontent.com/ministryofjustice/hmpps-approved-premises-api/main/src/main/resources/static/api.yml'

    try {
      execSync(`
        if [ ! -f /tmp/api.yml ]; then
          curl -s "${openAPIUrl}" > /tmp/api.yml
        fi
      `)
      execSync(`npx swagger-mock-validator /tmp/api.yml ${pactPath}`)
      return {
        message: () => `Swagger mock validator for ${pactPath} did not fail`,
        pass: true,
      }
    } catch (err) {
      return {
        message: () => err.output.toString(),
        pass: false,
      }
    }
  },
})
