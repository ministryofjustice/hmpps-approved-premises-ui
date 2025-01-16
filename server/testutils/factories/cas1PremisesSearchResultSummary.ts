import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1PremisesSearchResultSummary, Cas1SpaceCharacteristic } from '@approved-premises/api'
import namedIdFactory from './namedId'
import { sentenceCase } from '../../utils/utils'
import { apCharacteristicPairFactory } from './bedDetail'

const characteristics: ReadonlyArray<Cas1SpaceCharacteristic> = [
  'acceptsChildSexOffenders',
  'acceptsHateCrimeOffenders',
  'acceptsNonSexualChildOffenders',
  'acceptsSexOffenders',
  'hasArsonInsuranceConditions',
  'hasBrailleSignage',
  'hasCallForAssistance',
  'hasCrib7Bedding',
  'hasEnSuite',
  'hasFixedMobilityAids',
  'hasHearingLoop',
  'hasLift',
  'hasNearbySprinkler',
  'hasSmokeDetector',
  'hasStepFreeAccess',
  'hasStepFreeAccessToCommunalAreas',
  'hasTactileFlooring',
  'hasTurningSpace',
  'hasWheelChairAccessibleBathrooms',
  'hasWideAccessToCommunalAreas',
  'hasWideDoor',
  'hasWideStepFreeAccess',
  'isArsonDesignated',
  'isArsonSuitable',
  'isCatered',
  'isFullyFm',
  'isGroundFloor',
  'isGroundFloorNrOffice',
  'isIAP',
  'isSingle',
  'isStepFreeDesignated',
  'isSuitableForVulnerable',
  'isSuitedForSexOffenders',
  'isTopFloorVulnerable',
  'isWheelchairAccessible',
  'isWheelchairDesignated',
]

export default Factory.define<Cas1PremisesSearchResultSummary>(() => {
  return {
    id: faker.string.uuid(),
    apCode: faker.string.alphanumeric(5),
    deliusQCode: faker.string.alphanumeric(5),
    apType: faker.helpers.arrayElement(['normal', 'pipe', 'esap', 'rfap', 'mhapStJosephs', 'mhapElliottHouse']),
    name: `${sentenceCase(faker.lorem.word({}))} ${faker.helpers.arrayElement(['House', 'Lodge', 'Cottage', 'Court', 'Place', 'Hall', 'Manor', 'Mansion'])}`,
    postcode: faker.location.zipCode(),
    apArea: namedIdFactory.build(),
    totalSpaceCount: faker.number.int({ min: 5, max: 50 }),
    fullAddress: `${faker.location.streetAddress()}, ${faker.location.county()}, ${faker.location.city()}`,
    premisesCharacteristics: apCharacteristicPairFactory.buildList(5),
    characteristics: faker.helpers.arrayElements(characteristics),
  }
})
