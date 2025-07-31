import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1Premises, Cas1PremisesSearchResultSummary, Cas1SpaceCharacteristic } from '@approved-premises/api'
import namedIdFactory from './namedId'
import { sentenceCase } from '../../utils/utils'
import cas1PremisesLocalRestrictionSummary from './cas1PremisesLocalRestrictionSummary'
import { apTypes } from '../../utils/placementCriteriaUtils'

export const characteristics: ReadonlyArray<Cas1SpaceCharacteristic> = [
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
  'arsonOffences',
]

class Cas1PremisesSearchResultsSummaryFactory extends Factory<Cas1PremisesSearchResultSummary> {
  fromPremises(premises: Cas1Premises) {
    return this.params({
      ...premises,
      localRestrictions: premises.localRestrictions.map(restriction => restriction.description),
    })
  }
}

export default Cas1PremisesSearchResultsSummaryFactory.define(() => {
  return {
    id: faker.string.uuid(),
    apType: faker.helpers.arrayElement(apTypes),
    name: `${sentenceCase(faker.lorem.word({}))} ${faker.helpers.arrayElement(['House', 'Lodge', 'Cottage', 'Court', 'Place', 'Hall', 'Manor', 'Mansion'])}`,
    postcode: faker.location.zipCode(),
    apArea: namedIdFactory.build(),
    totalSpaceCount: faker.number.int({ min: 5, max: 50 }),
    fullAddress: `${faker.location.streetAddress()}, ${faker.location.county()}, ${faker.location.city()}`,
    characteristics: faker.helpers.arrayElements(characteristics),
    localRestrictions: cas1PremisesLocalRestrictionSummary
      .buildList(faker.number.int({ max: 3 }))
      .map(restriction => restriction.description),
  }
})
