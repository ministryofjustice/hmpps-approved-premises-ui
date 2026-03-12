import { Factory } from 'fishery'
import { CaseDetail } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import caseSummaryFactory from './caseSummary'
import offenceFactory from './offence'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<CaseDetail>(() => {
  const endDate = DateFormats.dateObjToIsoDate(faker.date.past())
  return {
    case: caseSummaryFactory.build(),
    offences: [...offenceFactory.buildList(5, { main: false }), offenceFactory.build({ main: true })],
    registrations: [],
    sentences: [
      {
        endDate,
        eventNumber: faker.number.int({ min: 1, max: 50 }).toString(),
        typeDescription: faker.lorem.sentence({ min: 1, max: 5 }),
        startDate: DateFormats.dateObjToIsoDate(faker.date.past({ refDate: endDate, years: 5 })),
      },
    ],
  }
})
