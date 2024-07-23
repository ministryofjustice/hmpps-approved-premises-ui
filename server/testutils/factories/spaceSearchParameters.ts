import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1SpaceSearchParameters } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import spaceBookingRequirements from './spaceBookingRequirements'

export default Factory.define<Cas1SpaceSearchParameters>(() => {
  return {
    startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
    durationInDays: faker.number.int({ min: 1, max: 70 }),
    targetPostcodeDistrict: faker.location.zipCode(),
    requirements: spaceBookingRequirements.build(),
  }
})
