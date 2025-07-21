import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { DatePeriod, Withdrawable } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Withdrawable>(() => ({
  type: faker.helpers.arrayElement(['placement_request', 'placement_application', 'space_booking']),
  id: faker.string.uuid(),
  dates: datePeriodFactory.buildList(Math.floor(Math.random() * 2) + 1),
}))

const datePeriodFactory = Factory.define<DatePeriod>(() => {
  return {
    startDate: DateFormats.dateObjToIsoDate(faker.date.recent()),
    endDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  }
})
