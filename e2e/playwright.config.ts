import { config } from 'dotenv'
import { defineConfig, devices } from '@playwright/test'
import { TestOptions } from '@approved-premises/e2e'

config({
  path: `e2e.env`,
  override: true,
})

export default defineConfig<TestOptions>({
  testDir: './',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  maxFailures: process.env.CI ? 3 : 1,
  workers: 2,
  reporter: 'html',
  timeout: process.env.CI ? 5 * 60 * 1000 : 2 * 60 * 1000,
  use: {
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup-dev',
      testMatch: /.*\.setup\.ts/,
      use: { baseURL: 'https://approved-premises-dev.hmpps.service.justice.gov.uk' },
    },
    {
      name: 'dev',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://approved-premises-dev.hmpps.service.justice.gov.uk',
      },
      dependencies: ['setup-dev'],
    },
    {
      name: 'setup-local',
      testMatch: /.*\.setup\.ts/,
      use: { baseURL: 'http://localhost:3000' },
    },
    {
      name: 'local',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
      },
      dependencies: ['setup-local'],
    },
  ],
  testIgnore: process.env.APPLICATION_TYPE ? [] : ['/utils/*.ts'],
})
