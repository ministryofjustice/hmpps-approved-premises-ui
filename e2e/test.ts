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
  cruMember: [
    { username: process.env.CAS1_E2E_CRU_MEMBER_USERNAME, password: process.env.CAS1_E2E_CRU_MEMBER_PASSWORD },
    { option: true },
  ],
  futureManager: [
    { username: process.env.CAS1_E2E_FUTURE_MANAGER_USERNAME, password: process.env.CAS1_E2E_FUTURE_MANAGER_PASSWORD },
    { option: true },
  ],
  legacyManager: [
    { username: process.env.CAS1_E2E_LEGACY_MANAGER_USERNAME, password: process.env.CAS1_E2E_LEGACY_MANAGER_PASSWORD },
    { option: true },
  ],
  administrator: [
    { username: process.env.CAS1_E2E_ADMINISTRATOR_USERNAME, password: process.env.CAS1_E2E_ADMINISTRATOR_PASSWORD },
    { option: true },
  ],
  reportViewer: [
    { username: process.env.CAS1_E2E_REPORT_VIEWER_USERNAME, password: process.env.CAS1_E2E_REPORT_VIEWER_PASSWORD },
    { option: true },
  ],
  assessor: [
    {
      username: process.env.CAS1_E2E_ASSESSOR_USERNAME,
      password: process.env.CAS1_E2E_ASSESSOR_PASSWORD,
      email: process.env.CAS1_E2E_ASSESSOR_EMAIL,
      name: process.env.CAS1_E2E_ASSESSOR_NAME,
    },
    { option: true },
  ],
  userWithoutRoles: [
    {
      username: process.env.CAS1_E2E_USER_WITHOUT_ROLES_USERNAME,
      password: process.env.CAS1_E2E_USER_WITHOUT_ROLES_PASSWORD,
    },
    { option: true },
  ],
  oasysSections: [['3. Accommodation', '13. Health', '4. Education, training and employment'], { option: true }],
  emergencyApplicationUser: [process.env.CAS1_E2E_EMERGENCY_ASSESSOR_NAME_TO_ALLOCATE_TO, { option: true }],
})
