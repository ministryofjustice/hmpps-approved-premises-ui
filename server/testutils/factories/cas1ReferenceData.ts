import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1ReferenceData } from '@approved-premises/ui'

import { Cas1CruManagementArea, Cas1OutOfServiceBedReason, DepartureReason } from '@approved-premises/api'

const cas1ReferenceDataFactory = Factory.define<Cas1ReferenceData>(() => ({
  id: faker.string.uuid(),
  name: faker.word.words({ count: { min: 1, max: 4 } }),
  isActive: true,
}))

export default cas1ReferenceDataFactory

export const cas1DepartureReasonsFactory = Factory.define<DepartureReason>(() => ({
  ...cas1ReferenceDataFactory.build(),
  serviceScope: 'approved-premises',
  parentReasonId: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.2 }),
}))

export const cas1OutOfServiceBedReasonFactory = Factory.define<Cas1OutOfServiceBedReason>(() => ({
  ...cas1ReferenceDataFactory.build(),
  referenceType: faker.helpers.arrayElement(['crn', 'workOrder']),
}))

export const cruManagementAreaFactory = Factory.define<Cas1CruManagementArea>(({ sequence }) => ({
  id: faker.string.uuid(),
  name: `${faker.location.city()}${sequence}`,
}))
