import { test as base } from '@playwright/test'

import { TestOptions } from './testOptions'

export default base.extend<TestOptions>({
  deliusUser: [
    {
      username: process.env.DELIUS_USERNAME as string,
      password: process.env.DELIUS_PASSWORD as string,
    },
    { option: true },
  ],
})
