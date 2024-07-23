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
  apType: faker.helpers.arrayElement(['normal', 'pipe', 'esap', 'rfap', 'mhapStJosephs', 'mhapElliottHouse']),
  targetPostcodeDistrict: faker.helpers.arrayElement(postcodeAreas),
}))
