import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { PremisesBooking } from '@approved-premises/api'
import { addDays, startOfToday } from 'date-fns'
import { DateFormats } from '../../utils/dateUtils'
import bedFactory from './bedSummary'
import { fullPersonFactory } from './person'

const today = DateFormats.dateObjToIsoDate(startOfToday())
const soon = () =>
  DateFormats.dateObjToIsoDate(
    faker.date.soon({ days: 5, refDate: addDays(new Date(new Date().setHours(0, 0, 0, 0)), 1) }),
  )
const past = () => DateFormats.dateObjToIsoDate(faker.date.past())
const future = () => DateFormats.dateObjToIsoDate(faker.date.future())
class PremisesBookingFactory extends Factory<PremisesBooking> {
  arrivingToday() {
    return this.params({
      arrivalDate: today,
      departureDate: future(),
      status: 'awaiting-arrival',
    })
  }

  arrivedToday() {
    return this.params({
      arrivalDate: today,
      departureDate: future(),
      status: 'arrived',
    })
  }

  arrived() {
    return this.params({
      arrivalDate: past(),
      departureDate: future(),
      status: 'arrived',
    })
  }

  notArrived() {
    return this.params({
      arrivalDate: past(),
      departureDate: future(),
      status: 'not-arrived',
    })
  }

  departingToday() {
    return this.params({
      arrivalDate: past(),
      departureDate: today,
      status: 'arrived',
    })
  }

  departedToday() {
    return this.params({
      arrivalDate: past(),
      departureDate: today,
      status: 'departed',
    })
  }

  arrivingSoon() {
    return this.params({
      arrivalDate: soon(),
      departureDate: future(),
      status: 'awaiting-arrival',
    })
  }

  cancelledWithFutureArrivalDate() {
    return this.params({
      arrivalDate: soon(),
      departureDate: future(),
      status: 'cancelled',
    })
  }

  departingSoon() {
    return this.params({
      departureDate: soon(),
      arrivalDate: past(),
      status: 'arrived',
    })
  }
}

export default PremisesBookingFactory.define(() => ({
  id: faker.string.uuid(),
  arrivalDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  departureDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  person: fullPersonFactory.build(),
  bed: bedFactory.build(),
  status: 'awaiting-arrival' as const,
}))
