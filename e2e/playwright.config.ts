import 'dotenv/config'
import { defineConfig, devices } from '@playwright/test'
import { TestOptions } from '@approved-premises/e2e'

export default defineConfig<TestOptions>({
  testDir: './',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  maxFailures: process.env.CI ? 3 : 1,
  workers: 1,
  reporter: 'html',
  timeout: process.env.CI ? 5 * 60 * 1000 : 2 * 60 * 1000,
  use: {
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setupDev',
      testMatch: /.*\.setup\.ts/,
      use: { baseURL: 'https://approved-premises-dev.hmpps.service.justice.gov.uk' },
    },
    {
      name: 'dev',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
        baseURL: 'https://approved-premises-dev.hmpps.service.justice.gov.uk',
      },
      dependencies: ['setupDev'],
    },
    {
      name: 'setupLocal',
      testMatch: /.*\.setup\.ts/,
      use: {
        baseURL: 'http://localhost:3000',
        user: {
          name: 'JIM SNOW',
          username: 'jimsnowldap',
          password: 'secret',
        },
      },
    },
    {
      name: 'local',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
        baseURL: 'http://localhost:3000',
        person: {
          name: 'Aadland Bertrand',
          crn: 'X320741',
        },
        user: {
          name: 'JIM SNOW',
          username: 'jimsnowldap',
          password: 'secret',
        },
        indexOffenceRequired: true,
        oasysSections: [
          '5. Finance',
          '6. Relationships',
          '7. Lifestyle',
          '10. Emotional',
          '11. Thinking and behavioural',
          '12. Attitude',
          '13. Health',
        ],
      },
      dependencies: ['setupLocal'],
    },
  ],
})
