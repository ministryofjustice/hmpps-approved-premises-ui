import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1Premises, Cas1SpaceCharacteristic } from '@approved-premises/api'
import { apAreaFactory } from './referenceData'
import cas1PremisesLocalRestrictionSummaryFactory from './cas1PremisesLocalRestrictionSummary'
import { spaceSearchCriteriaApLevelLabels } from '../../utils/characteristicsUtils'

export default Factory.define<Cas1Premises>(() => ({
  id: faker.string.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  fullAddress: `${faker.location.streetAddress()}, ${faker.location.city()}`,
  postcode: faker.location.zipCode(),
  apCode: `${faker.string.alpha(2)}`,
  bedCount: 50,
  availableBeds: faker.number.int({ min: 0, max: 50 }),
  outOfServiceBeds: faker.number.int({ min: 0, max: 50 }),
  apArea: apAreaFactory.build(),
  supportsSpaceBookings: true,
  managerDetails: `${faker.person}`,
  overbookingSummary: [],
  localRestrictions: cas1PremisesLocalRestrictionSummaryFactory.buildList(faker.number.int({ max: 3 })),
  characteristics: faker.helpers.arrayElements(
    Object.keys(spaceSearchCriteriaApLevelLabels) as Array<Cas1SpaceCharacteristic>,
  ),
}))
