import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { ExtendedPremisesSummary } from '@approved-premises/api'
import premisesBookingFactory from './premisesBooking'
import dateCapacityFactory from './dateCapacity'

export default Factory.define<ExtendedPremisesSummary>(() => ({
  id: faker.string.uuid(),
  name: faker.lorem.words(3),
  apCode: faker.string.alphanumeric(5),
  postcode: faker.location.zipCode(),
  bedCount: 50,
  availableBedsForToday: faker.number.int({ min: 0, max: 50 }),
  bookings: premisesBookingFactory.buildList(4),
  dateCapacities: dateCapacityFactory.buildList(3),
}))
