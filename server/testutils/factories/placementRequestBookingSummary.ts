import { Factory } from 'fishery'

import { faker } from '@faker-js/faker'
import { addDays } from 'date-fns'
import type { Cas1SpaceBooking, Cas1SpaceBookingSummary, PlacementRequestBookingSummary } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

class PlacementRequestBookingSummaryFactory extends Factory<PlacementRequestBookingSummary> {
  fromSpaceBooking(spaceBooking: Cas1SpaceBooking | Cas1SpaceBookingSummary) {
    return this.params({
      id: spaceBooking.id,
      premisesId: spaceBooking.premises.id,
      premisesName: spaceBooking.premises.name,
      arrivalDate: spaceBooking.expectedArrivalDate,
      departureDate: spaceBooking.expectedDepartureDate,
    })
  }
}

export default PlacementRequestBookingSummaryFactory.define(() => ({
  id: faker.string.uuid(),
  type: 'space',
  premisesId: faker.string.uuid(),
  premisesName: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  arrivalDate: DateFormats.dateObjToIsoDate(
    faker.date.soon({ days: 5, refDate: addDays(new Date(new Date().setHours(0, 0, 0, 0)), 1) }),
  ),
  departureDate: DateFormats.dateObjToIsoDate(
    faker.date.soon({ days: 10, refDate: addDays(new Date(new Date().setHours(0, 0, 0, 0)), 1) }),
  ),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
}))
