import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'
import { Cas1AssessmentSummary } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import risksFactory from './risks'
import { fullPersonFactory, restrictedPersonFactory } from './person'

class Cas1AssessmentSummaryFactory extends Factory<Cas1AssessmentSummary> {
  createdXDaysAgo(days: number) {
    const today = new Date()
    return this.params({
      createdAt: DateFormats.dateObjToIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - days)),
    })
  }
}

export default Cas1AssessmentSummaryFactory.define(() => ({
  type: 'CAS1' as const,
  id: faker.string.uuid(),
  applicationId: faker.string.uuid(),
  arrivalDate: DateFormats.dateObjToIsoDateTime(faker.date.future()),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  dateOfInfoRequest: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  status: 'not_started' as const,
  risks: risksFactory.build(),
  person: faker.helpers.arrayElement([fullPersonFactory.build(), restrictedPersonFactory.build()]),
  dueAt: DateFormats.dateObjToIsoDateTime(faker.date.future()),
}))
