import { AssessmentSummary } from '@approved-premises/api'
import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'
import { DateFormats } from '../../utils/dateUtils'
import risksFactory from './risks'
import personFactory from './person'

export default Factory.define<AssessmentSummary>(() => ({
  type: 'CAS1',
  id: faker.string.uuid(),
  applicationId: faker.string.uuid(),
  arrivalDate: DateFormats.dateObjToIsoDateTime(faker.date.future()),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  dateOfInfoRequest: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  status: 'not_started',
  risks: risksFactory.build(),
  person: personFactory.build(),
}))
