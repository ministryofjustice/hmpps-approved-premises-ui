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
  userToAddAndDelete: [{ name: process.env.CAS1_E2E_DELIUS_USERNAME_TO_ADD_AND_DELETE as string }, { option: true }],
  futureManager: [
    { username: process.env.CAS1_E2E_FUTURE_MANAGER_USERNAME, password: process.env.CAS1_E2E_FUTURE_MANAGER_PASSWORD },
    { option: true },
  ],

  oasysSections: [['3. Accommodation', '13. Health', '4. Education, training and employment'], { option: true }],
  emergencyApplicationUser: [process.env.CAS1_E2E_EMERGENCY_ASSESSOR_NAME_TO_ALLOCATE_TO, { option: true }],
})
