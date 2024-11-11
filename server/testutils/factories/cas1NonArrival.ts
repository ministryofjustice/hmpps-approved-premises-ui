import { Factory } from 'fishery'
import { Cas1NonArrival } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas1NonArrival>(() => ({
  reason: faker.word.words(3),
  notes: faker.lorem.words(50),
  confirmedAt: DateFormats.dateObjToIsoDateTime(
    new Date(faker.date.recent().getTime() + faker.number.int({ max: 1000 * 60 * 60 * 24 })),
  ),
}))
