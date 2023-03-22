import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import {
  ApprovedPremisesBedSearchResult as BedSearchResult,
  BedSearchResults,
  CharacteristicPair,
} from '../../@types/shared'

export default Factory.define<BedSearchResults>(() => ({
  results: bedSearchResultFactory.buildList(3),
  resultsBedCount: faker.datatype.number({ min: 0, max: 50 }),
  resultsPremisesCount: faker.datatype.number({ min: 0, max: 20 }),
  resultsRoomCount: faker.datatype.number({ min: 0, max: 30 }),
}))

const bedSearchResultFactory = Factory.define<BedSearchResult>(() => ({
  premises: premisesSummaryFactory.build(),
  room: roomSummaryFactory.build(),
  bed: bedSummaryFactory.build(),
  distanceMiles: faker.datatype.number({ min: 0, max: 100 }),
}))

const premisesSummaryFactory = Factory.define<BedSearchResult['premises']>(() => ({
  addressLine1: faker.address.streetAddress(),
  addressLine2: faker.address.secondaryAddress(),
  town: faker.address.city(),
  id: faker.datatype.uuid(),
  name: faker.company.name(),
  postcode: 'SW1',
  characteristics: apCharacteristicPairFactory.buildList(3),
  bedCount: faker.datatype.number({ min: 0, max: 10 }),
}))

export const apCharacteristicPairFactory = Factory.define<CharacteristicPair>(() => ({
  name: faker.helpers.arrayElement(['isIAP', 'isPIPE', 'isESAP']),
  premises: faker.company.name(),
}))

const roomCharacteristicFactory = Factory.define<CharacteristicPair>(() => ({
  name: faker.helpers.arrayElement(['isGroundFloor', 'isArsonDesignated', 'isWheelchairDesignated']),
  premises: faker.company.name(),
}))

const roomSummaryFactory = Factory.define<BedSearchResult['room']>(() => ({
  characteristics: roomCharacteristicFactory.buildList(3),
  id: faker.datatype.uuid(),
  name: faker.company.name(),
}))

const bedSummaryFactory = Factory.define<BedSearchResult['bed']>(() => ({
  id: faker.datatype.uuid(),
  name: faker.company.name(),
  characteristics: apCharacteristicPairFactory.buildList(3),
}))
