import { Factory } from 'fishery'
import { Cas1NewDeparture } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas1NewDeparture>(() => {
  const departureDateTime = faker.date.recent({ days: 1 }).toISOString()

  return {
    departureDate: DateFormats.isoDateTimeToIsoDate(departureDateTime),
    departureTime: DateFormats.isoDateTimeToTime(departureDateTime),
    reasonId: faker.string.uuid(),
    moveOnCategoryId: faker.string.uuid(),
    notes: faker.word.words(),
  }
})
