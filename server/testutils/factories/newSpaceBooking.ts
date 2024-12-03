import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1NewSpaceBooking } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import spaceBookingRequirementsFactory from './spaceBookingRequirements'

export default Factory.define<Cas1NewSpaceBooking>(() => {
  const startDate = faker.date.soon()
  const endDate = faker.date.future()
  return {
    arrivalDate: DateFormats.dateObjToIsoDate(startDate),
    departureDate: DateFormats.dateObjToIsoDate(endDate),
    premisesId: faker.string.uuid(),
    requirements: spaceBookingRequirementsFactory.build(),
  }
})
