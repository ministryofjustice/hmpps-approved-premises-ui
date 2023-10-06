import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { PremisesBooking } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import bedFactory from './bedSummary'
import { fullPersonFactory } from './person'

export default Factory.define<PremisesBooking>(() => ({
  id: faker.string.uuid(),
  arrivalDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  departureDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  person: fullPersonFactory.build(),
  bed: bedFactory.build(),
  status: 'awaiting-arrival',
}))
