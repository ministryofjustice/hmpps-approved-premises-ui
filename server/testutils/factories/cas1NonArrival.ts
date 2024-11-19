import { Factory } from 'fishery'
import { Cas1NonArrival } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas1NonArrival>(() => ({
  reason: faker.string.uuid(),
  notes: faker.lorem.words(20),
  confirmedAt: DateFormats.dateObjToIsoDateTime(faker.date.recent()),
}))
