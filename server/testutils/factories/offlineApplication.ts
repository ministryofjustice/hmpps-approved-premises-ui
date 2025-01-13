import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { OfflineApplication } from '@approved-premises/api'

import { fullPersonFactory, restrictedPersonFactory } from './person'
import { DateFormats } from '../../utils/dateUtils'

class OfflineApplicationFactory extends Factory<OfflineApplication> {}

export default OfflineApplicationFactory.define(() => ({
  type: 'CAS1',
  id: faker.string.uuid(),
  person: faker.helpers.arrayElement([fullPersonFactory.build(), restrictedPersonFactory.build()]),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
}))
