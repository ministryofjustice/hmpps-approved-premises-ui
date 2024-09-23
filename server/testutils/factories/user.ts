import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type {
  ProfileResponse,
  ApprovedPremisesUser as User,
  UserQualification,
  ApprovedPremisesUserRole as UserRole,
  UserSummary,
  UserWithWorkload,
} from '@approved-premises/api'
import { apAreaFactory } from './referenceData'

const userFactory = Factory.define<User>(() => ({
  name: faker.person.fullName(),
  deliusUsername: faker.internet.userName(),
  email: faker.internet.email(),
  telephoneNumber: faker.phone.number(),
  roles: roleFactory.buildList(Math.floor(Math.random() * 10)),
  qualifications: qualificationFactory.buildList(Math.floor(Math.random() * 2)),
  id: faker.string.uuid(),
  region: faker.helpers.arrayElement([{ id: faker.string.uuid(), name: faker.location.county() }]),
  service: 'ApprovedPremises',
  isActive: true,
  apArea: apAreaFactory.build(),
  version: faker.number.int(),
}))

export const userSummaryFactory = Factory.define<UserSummary>(() => ({
  name: faker.person.fullName(),
  id: faker.string.uuid(),
}))

export const userWithWorkloadFactory = Factory.define<UserWithWorkload>(({ params }) => ({
  ...userFactory.build(params),
  numTasksPending: faker.number.int({ min: 0, max: 10 }),
  numTasksCompleted7Days: faker.number.int({ min: 0, max: 15 }),
  numTasksCompleted30Days: faker.number.int({ min: 0, max: 45 }),
}))

export const userProfileFactory = Factory.define<ProfileResponse>(() => ({
  deliusUsername: faker.internet.userName(),
  user: userFactory.build(),
}))

const roleFactory = Factory.define<UserRole>(() =>
  faker.helpers.arrayElement([
    'assessor',
    'matcher',
    'workflow_manager',
    'applicant',
    'role_admin',
    'report_viewer',
    'excluded_from_assess_allocation',
    'excluded_from_match_allocation',
    'excluded_from_placement_application_allocation',
  ]),
)

export const qualificationFactory = Factory.define<UserQualification>(() =>
  faker.helpers.arrayElement(['pipe', 'emergency', 'esap', 'lao', 'womens']),
)

export default userFactory
