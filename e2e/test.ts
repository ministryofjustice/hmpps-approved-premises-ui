import { PersonTier, TestOptions } from '@approved-premises/e2e'
import { test as base } from '@playwright/test'
import { useTestPerson } from './fixtures/person'
import { createOasysAssessment } from './steps/oasys'

type V3PersonFixtures = {
  unassessedPerson: TestOptions['person']
}

const configuredPersonTier = process.env.CAS1_E2E_PERSON_TIER || 'A'
if (
  configuredPersonTier !== 'A' &&
  configuredPersonTier !== 'B' &&
  configuredPersonTier !== 'C' &&
  configuredPersonTier !== 'D' &&
  configuredPersonTier !== 'E' &&
  configuredPersonTier !== 'F' &&
  configuredPersonTier !== 'G' &&
  configuredPersonTier !== 'MISSING' &&
  configuredPersonTier !== 'NOT_SUPERVISED'
) {
  throw new Error('CAS1_E2E_PERSON_TIER must be "A", "B", "C", "D", "E", "F", "G", "MISSING" or "NOT_SUPERVISED"')
}
const personTier: PersonTier = configuredPersonTier

export const test = base.extend<TestOptions & V3PersonFixtures>({
  personTier: [personTier, { option: true }],
  unassessedPerson: [
    async ({ context, personTier: requestedTier }, use) => {
      await useTestPerson(context, requestedTier, use)
    },
    { timeout: 3 * 60 * 1000 },
  ],
  person: [
    async ({ context, personTier: requestedTier, unassessedPerson }, use) => {
      if (requestedTier !== 'MISSING' && requestedTier !== 'NOT_SUPERVISED') {
        await createOasysAssessment(context, unassessedPerson, requestedTier)
      }

      await use(unassessedPerson)
    },
    { timeout: 2 * 60 * 1000 },
  ],
  personForAdHocBooking: [{ crn: process.env.CAS1_E2E_PERSON_FOR_ADHOC_BOOKING_CRN }, { option: true }],
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
  oasysSections: [[], { option: true }],
  emergencyApplicationUser: [process.env.CAS1_E2E_EMERGENCY_ASSESSOR_NAME_TO_ALLOCATE_TO, { option: true }],
})
