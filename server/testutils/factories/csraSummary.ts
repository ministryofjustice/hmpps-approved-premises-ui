import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { CsraSummary } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<CsraSummary>(() => ({
  assessmentAgencyId: faker.string.uuid(),
  assessmentCode: faker.string.alpha({ length: 5 }),
  assessmentComment: faker.lorem.words(20),
  assessmentDate: DateFormats.dateObjToIsoDate(faker.date.recent({ days: 50 })),
  assessmentSeq: faker.number.int({ min: 1, max: 20 }),
  cellSharingAlertFlag: faker.datatype.boolean(),
  classificationCode: faker.string.alpha({ length: 5 }),
  bookingId: faker.number.int({ min: 1, max: 20 }),
}))
