import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import {
  ApprovedPremisesBedSearchResult as BedSearchResult,
  BedSearchResults,
  CharacteristicPair,
} from '../../@types/shared'
import { roomCharacteristicPairFactory } from './room'
import { placementCriteria } from './placementRequest'

export const bedSearchResultsFactory = Factory.define<BedSearchResults>(() => ({
  results: bedSearchResultFactory.buildList(3),
  resultsBedCount: faker.number.int({ min: 0, max: 50 }),
  resultsPremisesCount: faker.number.int({ min: 0, max: 20 }),
  resultsRoomCount: faker.number.int({ min: 0, max: 30 }),
}))

export const bedSearchResultFactory = Factory.define<BedSearchResult>(() => ({
  serviceName: 'approved-premises',
  premises: premisesSummaryFactory.build(),
  room: roomSummaryFactory.build(),
  bed: bedSummaryFactory.build(),
  distanceMiles: faker.number.int({ min: 0, max: 100 }),
}))

const premisesSummaryFactory = Factory.define<BedSearchResult['premises']>(() => ({
  addressLine1: faker.location.streetAddress(),
  addressLine2: faker.location.secondaryAddress(),
  town: faker.location.city(),
  id: faker.string.uuid(),
  name: faker.company.name(),
  postcode: 'SW11',
  characteristics: apCharacteristicPairFactory.buildList(3),
  bedCount: faker.number.int({ min: 0, max: 10 }),
}))

export const apCharacteristicPairFactory = Factory.define<CharacteristicPair>(() => ({
  name: faker.lorem.sentence(),
  propertyName: faker.helpers.arrayElement(placementCriteria),
}))

const roomSummaryFactory = Factory.define<BedSearchResult['room']>(() => ({
  characteristics: roomCharacteristicPairFactory.buildList(3),
  id: faker.string.uuid(),
  name: faker.company.name(),
}))

const bedSummaryFactory = Factory.define<BedSearchResult['bed']>(() => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  characteristics: apCharacteristicPairFactory.buildList(3),
}))
