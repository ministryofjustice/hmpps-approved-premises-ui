import { Factory } from 'fishery'
import type { Cas1SpaceBookingDeparture } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import ReferenceData, { departureReasonFactory } from './referenceData'

class Cas1SpaceBookingDepartureFactory extends Factory<Cas1SpaceBookingDeparture> {}

export default Cas1SpaceBookingDepartureFactory.define(() => ({
  reason: departureReasonFactory.build(),
  parentReason: undefined,
  moveOnCategory: ReferenceData.moveOnCategories().build(),
  notes: faker.word.words(20),
}))
