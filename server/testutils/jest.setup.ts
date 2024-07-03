/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable-next-line import/no-extraneous-dependencies */
import { execSync } from 'child_process'
import path from 'path'
import type { IdentityBarMenuItem } from '@approved-premises/ui'
import { diffStringsUnified } from 'jest-diff'

export {}

type ManageAction = {
  text: string
  classes: string
  href: string
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toContainManageAction(expected: ManageAction): R
      toContainMenuItem(expected: IdentityBarMenuItem): R
      toMatchStringIgnoringWhitespace(expected: string): R
      toMatchOpenAPISpec({ cas1Namespace }: { cas1Namespace: boolean }): R
    }
  }
}

const apiSpecPaths = {
  cas1Spec: path.join(__dirname, '..', '..', 'tmp', 'cas1-api.yml'),
  apiSpec: path.join(__dirname, '..', '..', 'tmp', 'api.yml'),
}

const apiSpecs = {
  cas1: {
    url: 'https://raw.githubusercontent.com/ministryofjustice/hmpps-approved-premises-api/main/src/main/resources/static/codegen/built-cas1-api-spec.yml',
    command: (openAPIUrl: string) => `if [ ! -f ${apiSpecPaths.cas1Spec} ]; then
    curl -s "${openAPIUrl}" |
    sed -E 's@/premises@/cas1/premises@g' |
    sed -E 's@ /out-of-service-beds@ /cas1/out-of-service-beds@g' |
    sed -E 's@ /reference-data@ /cas1/reference-data@g' |
    sed -E 's@/reports@/cas1/reports@g' > ${apiSpecPaths.cas1Spec}
  fi`,
    specPath: apiSpecPaths.cas1Spec,
  },
  api: {
    url: 'https://raw.githubusercontent.com/ministryofjustice/hmpps-approved-premises-api/main/src/main/resources/static/codegen/built-api-spec.yml',
    command: (openAPIUrl: string) => `if [ ! -f ${apiSpecPaths.apiSpec} ]; then
    curl -s "${openAPIUrl}" > ${apiSpecPaths.apiSpec}
  fi`,
    specPath: apiSpecPaths.apiSpec,
  },
}

expect.extend({
  toContainManageAction(actions, argument) {
    const pass = this.equals(actions, expect.arrayContaining([expect.objectContaining(argument)]))

    if (pass) {
      return {
        message: () =>
          `expected ${this.utils.printReceived(actions)} not to contain manage action ${this.utils.printExpected(argument)}`,
        pass: true,
      }
    }
    return {
      message: () =>
        `expected ${this.utils.printReceived(actions)} to contain manage action ${this.utils.printExpected(argument)}`,
      pass: false,
    }
  },
})

expect.extend({
  toContainMenuItem(received, argument) {
    const menuItems = received[0].items
    const pass = this.equals(menuItems, expect.arrayContaining([expect.objectContaining(argument)]))

    if (pass) {
      return {
        message: () =>
          `expected ${this.utils.printReceived(menuItems)} not to contain menu item ${this.utils.printExpected(argument)}`,
        pass: true,
      }
    }
    return {
      message: () =>
        `expected ${this.utils.printReceived(menuItems)} to contain menu item ${this.utils.printExpected(argument)}`,
      pass: false,
    }
  },
})

expect.extend({
  toMatchStringIgnoringWhitespace(received, expected) {
    const pass = received.replace(/\s+/g, ``) === expected.replace(/\s+/g, ``)

    return {
      pass,
      message: pass
        ? () => `expected received not to match expected ${diffStringsUnified(expected, received)}`
        : () => `expected received to match expected ${diffStringsUnified(expected, received)}`,
    }
  },
  toMatchOpenAPISpec(pactPath, { cas1Namespace }) {
    const { url, command, specPath } = cas1Namespace ? apiSpecs.cas1 : apiSpecs.api

    try {
      execSync(command(url))
      execSync(`npx swagger-mock-validator ${specPath} ${pactPath}`)
      return {
        message: () => `Swagger mock validator for ${pactPath} did not fail`,
        pass: true,
      }
    } catch (error) {
      return {
        message: () => error.output.toString(),
        pass: false,
      }
    }
  },
})
