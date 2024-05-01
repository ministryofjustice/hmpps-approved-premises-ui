import { TestOptions } from '@approved-premises/e2e'
import { test as base } from '@playwright/test'

export const test = base.extend<TestOptions>({
  person: [
    {
      name: 'Ben Davies',
      crn: 'X371199',
    },
    { option: true },
  ],
  user: [
    {
      name: (process.env.HMPPS_AUTH_NAME || 'Approved Premises E2ETester') as string,
      username: process.env.HMPPS_AUTH_USERNAME as string,
      password: process.env.HMPPS_AUTH_PASSWORD as string,
      email: process.env.HMPPS_AUTH_EMAIL as string,
    },
    { option: true },
  ],
  oasysSections: [['3. Accommodation', '13. Health', '4. Education, training and employment'], { option: true }],
  emergencyApplicationUser: ['AP_USER TEST_1', { option: true }],
})
