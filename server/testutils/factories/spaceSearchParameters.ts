import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1SpaceSearchParameters, Cas1SpaceSearchRequirements } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import { filterOutAPTypes, filterToSpaceBookingCharacteristics } from '../../utils/match'
import { placementCriteria } from './placementRequest'
import postcodeAreas from '../../etc/postcodeAreas.json'
import { SpaceSearchParametersUi } from '../../@types/ui'

const spaceBookingRequirements = Factory.define<Cas1SpaceSearchRequirements>(() => {
  return {
    apType: faker.helpers.arrayElement(['normal', 'pipe', 'esap', 'rfap', 'mhapStJosephs', 'mhapElliottHouse']),
    spaceCharacteristics: faker.helpers.arrayElements(filterOutAPTypes(placementCriteria)),
    gender: faker.helpers.arrayElement(['male', 'female']),
  }
})

export default Factory.define<Cas1SpaceSearchParameters>(() => {
  return {
    applicationId: faker.string.uuid(),
    startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
    durationInDays: faker.number.int({ min: 1, max: 70 }),
    targetPostcodeDistrict: faker.location.zipCode(),
    requirements: spaceBookingRequirements.build(),
  }
})

export const spaceSearchParametersUiFactory = Factory.define<SpaceSearchParametersUi>(() => {
  const startDateInputsValues = DateFormats.dateObjectToDateInputs(faker.date.soon(), 'startDate')
  return {
    applicationId: faker.string.uuid(),
    startDate: startDateInputsValues.startDate,
    targetPostcodeDistrict: faker.helpers.arrayElement(postcodeAreas),
    durationInDays: faker.number.int({ max: 100, min: 1 }).toString(),
    requirements: {
      apType: faker.helpers.arrayElement(['pipe', 'esap', 'rfap', 'mhapStJosephs', 'mhapElliottHouse']),
      spaceCharacteristics: faker.helpers.arrayElements(filterToSpaceBookingCharacteristics(placementCriteria)),
      gender: faker.helpers.arrayElement(['male', 'female']),
    },
    ...startDateInputsValues,
  }
})
