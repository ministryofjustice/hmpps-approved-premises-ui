import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { type Cas1SpaceBookingDeparture } from '@approved-premises/api'

class Cas1SpaceBookingDepartureFactory extends Factory<Cas1SpaceBookingDeparture> {}

export default Cas1SpaceBookingDepartureFactory.define(() => {
  return {
    notes: faker.word.words(20),
    parentReason: {
      id: faker.string.uuid(),
      name: `${faker.word.noun()} ${faker.word.verb()}`,
    },
    reason: {
      id: faker.string.uuid(),
      name: `${faker.word.noun()} ${faker.word.verb()}`,
    },
    moveOnCategory: {
      id: faker.string.uuid(),
      name: `${faker.word.noun()} ${faker.word.verb()}`,
    },
  }
})
