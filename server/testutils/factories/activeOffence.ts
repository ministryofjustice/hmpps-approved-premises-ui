import type { ActiveOffence } from '@approved-premises/api'

import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<ActiveOffence>(() => ({
  deliusEventNumber: faker.string.uuid(),
  offenceDescription: faker.lorem.sentence(),
  offenceId: faker.string.uuid(),
  convictionId: faker.number.int(),
  offenceDate: DateFormats.dateObjToIsoDate(faker.date.past()),
}))
