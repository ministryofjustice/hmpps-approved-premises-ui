import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { ActiveOffence } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<ActiveOffence>(() => ({
  deliusEventNumber: String(faker.number.int({ min: 0, max: 20 })),
  offenceDescription: faker.lorem.sentence(),
  offenceId: faker.string.uuid(),
  convictionId: faker.number.int(),
  offenceDate: DateFormats.dateObjToIsoDate(faker.date.past()),
}))
