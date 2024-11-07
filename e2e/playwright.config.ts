import 'dotenv/config'
import { defineConfig, devices } from '@playwright/test'
import { TestOptions } from '@approved-premises/e2e'

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
      name: 'setup-local-dev-upstream',
      testMatch: /.*\.setup\.ts/,
      use: { baseURL: 'http://localhost:3000' },
    },
    {
      name: 'local-dev-upstream',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
      },
      dependencies: ['setup-local-dev-upstream'],
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
        person: {
          name: 'Aadland Bertrand',
          crn: 'X320741',
          tier: 'D2',
        },
        indexOffenceRequired: true,
        oasysSections: [
          '6. Relationships',
          '7. Lifestyle',
          '10. Emotional',
          '11. Thinking and behavioural',
          '12. Attitude',
          '13. Health',
        ],
      },
      dependencies: ['setup-local'],
    },
  ],
  testIgnore: process.env.APPLICATION_TYPE ? [] : ['/utils/*.ts'],
})
