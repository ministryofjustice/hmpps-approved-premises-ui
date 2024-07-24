import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1SpaceSearchParameters } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import spaceBookingRequirements from './spaceBookingRequirements'
import { SpaceSearchParametersUi } from '../../@types/ui'
import postcodeAreas from '../../etc/postcodeAreas.json'

export default Factory.define<Cas1SpaceSearchParameters>(() => {
  return {
    startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
    durationInDays: faker.number.int({ min: 1, max: 70 }),
    targetPostcodeDistrict: faker.location.zipCode(),
    requirements: spaceBookingRequirements.build(),
  }
})

export const spaceSearchParametersUiFactory = Factory.define<SpaceSearchParametersUi>(() => ({
  durationDays: faker.number.int({ min: 1, max: 70 }).toString(),
  durationWeeks: faker.number.int({ min: 1, max: 12 }).toString(),
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  targetPostcodeDistrict: faker.helpers.arrayElement(postcodeAreas),
  requirements: {
    apTypes: faker.helpers.arrayElements(['normal', 'pipe', 'esap', 'rfap', 'mhapStJosephs', 'mhapElliottHouse']),
    needCharacteristics: faker.helpers.arrayElements(['single', 'enSuite', 'wheelchair', 'limitedMobility', 'catered']),
    riskCharacteristics: faker.helpers.arrayElements([
      'atRiskOfExploitation',
      'arson',
      'posesSexualRiskToAdults',
      'posesSexualRiskToChildren',
      'posesNonSexualRiskToChildren',
    ]),
    genders: faker.helpers.arrayElements(['male', 'female']),
  },
}))
