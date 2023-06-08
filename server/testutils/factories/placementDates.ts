import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { PlacementDates } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<PlacementDates>(() => ({
  expectedArrival: DateFormats.dateObjToIsoDate(faker.date.soon()),
  duration: faker.number.int({ min: 1, max: 12 }),
}))
