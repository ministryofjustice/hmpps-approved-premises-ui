import { Factory } from 'fishery'
import { CaseDetail, MappaDetail, NoteDetail, PersonalContact, Registration } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import caseSummaryFactory from './caseSummary'
import offenceFactory from './offence'
import { DateFormats } from '../../utils/dateUtils'

const noteDetail = Factory.define<NoteDetail>(() => ({
  note: faker.lorem.sentence(2),
  date: DateFormats.dateObjToIsoDate(faker.date.past()),
}))

export const mappaDetailFactory = Factory.define<MappaDetail>(() => ({
  category: faker.number.int({ min: 1, max: 10 }),
  categoryDescription: faker.helpers.arrayElement(['MAPPA CAT1', 'MAPPA CAT2', 'MAPPA CAT3']),
  lastUpdated: DateFormats.dateObjToIsoDate(faker.date.past()),
  level: faker.number.int({ min: 1, max: 10 }),
  levelDescription: faker.helpers.arrayElement(['MAPPA LEVEL 1', 'MAPPA LEVEL2', 'MAPPA LEVEL3']),
  startDate: DateFormats.dateObjToIsoDate(faker.date.past()),
}))

export const registrationFactory = Factory.define<Registration>(({ sequence }) => ({
  code: `RG${sequence}`,
  description: faker.word.words(2),
  startDate: DateFormats.dateObjToIsoDate(faker.date.past()),
  riskNotes: faker.lorem.sentence(4),
  riskNotesDetail: noteDetail.buildList(3),
  riskFlagGroupDescription: faker.helpers.arrayElement(['Cohort', 'Public protection', 'Safeguarding Risks', 'RoSH']),
}))

export const personalContact = Factory.define<PersonalContact>(() => ({
  address: { addressNumber: `${faker.number.int({ min: 1, max: 30 })}` },
  name: { forename: faker.person.firstName(), middleNames: [], surname: faker.person.lastName() },
  relationship: faker.string.alphanumeric(),
  relationshipType: { code: faker.helpers.arrayElement(['R1', 'R2', 'R3']), description: faker.word.words(4) },
  telephoneNumber: faker.string.numeric({ length: 10 }),
}))

export default Factory.define<CaseDetail>(() => {
  const endDate = DateFormats.dateObjToIsoDate(faker.date.past())
  return {
    case: caseSummaryFactory.build(),
    offences: [...offenceFactory.buildList(5, { main: false }), offenceFactory.build({ main: true })],
    registrations: [
      registrationFactory.build({ code: 'RHRH', description: 'High RoSH', startDate: '2025-08-06' }),
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
    personalContacts: personalContact.buildList(3),
    mappaDetail: mappaDetailFactory.build(),
  }
})
