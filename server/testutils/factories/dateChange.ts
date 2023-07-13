import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { NewDateChange } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<NewDateChange>(() => ({
  newArrivalDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  newDepartureDate: DateFormats.dateObjToIsoDate(faker.date.future()),
}))
