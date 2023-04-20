import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { NewPlacementRequestBooking, NewPlacementRequestBookingConfirmation } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'

export const newPlacementRequestBookingFactory = Factory.define<NewPlacementRequestBooking>(() => {
  const arrivalDate = faker.date.soon()
  const departureDate = faker.date.future()

  return {
    arrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
    departureDate: DateFormats.dateObjToIsoDate(departureDate),
    bedId: faker.datatype.uuid(),
  }
})

export const newPlacementRequestBookingConfirmationFactory = Factory.define<NewPlacementRequestBookingConfirmation>(
  () => {
    const arrivalDate = faker.date.soon()
    const departureDate = faker.date.future()

    return {
      arrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
      departureDate: DateFormats.dateObjToIsoDate(departureDate),
      premisesName: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
    }
  },
)
