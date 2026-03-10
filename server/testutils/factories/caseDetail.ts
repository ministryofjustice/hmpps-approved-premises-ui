import { Factory } from 'fishery'
import { CaseDetail, NoteDetail, Registration } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import caseSummaryFactory from './caseSummary'
import offenceFactory from './offence'
import { DateFormats } from '../../utils/dateUtils'

const noteDetail = Factory.define<NoteDetail>(() => ({
  note: faker.lorem.sentence(2),
  date: DateFormats.dateObjToIsoDate(faker.date.past()),
}))

export const registrationFactory = Factory.define<Registration>(({ sequence }) => ({
  code: `RG${sequence}`,
  description: faker.word.words(2),
  startDate: DateFormats.dateObjToIsoDate(faker.date.past()),
  riskNotes: faker.lorem.sentence(4),
  riskNotesDetail: noteDetail.buildList(3),
}))

export default Factory.define<CaseDetail>(() => {
  const endDate = DateFormats.dateObjToIsoDate(faker.date.past())
  return {
    case: caseSummaryFactory.build(),
    offences: [...offenceFactory.buildList(5, { main: false }), offenceFactory.build({ main: true })],
    registrations: [
      registrationFactory.build({ code: 'RHRH', description: 'High RoSH', startDate: '2025-08-06' }),
      registrationFactory.build({ code: 'MAPP', description: 'CAT 2 / LEVEL 1', startDate: '2025-08-06' }),
      ...registrationFactory.buildList(5),
    ],
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
