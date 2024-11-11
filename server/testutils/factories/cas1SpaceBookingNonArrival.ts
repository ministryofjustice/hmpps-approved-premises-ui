import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { type Cas1SpaceBookingNonArrival } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

class Cas1SpaceBookingNonArrivalFactory extends Factory<Cas1SpaceBookingNonArrival> {}

export default Cas1SpaceBookingNonArrivalFactory.define(() => {
  return {
    notes: faker.word.words(20),
    reason: {
      id: faker.string.uuid(),
      name: `${faker.word.noun()} ${faker.word.verb()}`,
    },
    confirmedAt: DateFormats.dateObjToIsoDate(
      new Date(faker.date.recent().getTime() + faker.number.int({ max: 60 * 60 * 24 * 1000 })),
    ),
  }
})
