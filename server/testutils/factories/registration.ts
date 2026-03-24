import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { NoteDetail, Registration } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export const noteDetailFactory = Factory.define<NoteDetail>(() => ({
  date: DateFormats.dateObjToIsoDate(faker.date.past()),
  note: faker.lorem.sentence(),
}))

export default Factory.define<Registration>(() => ({
  code: faker.string.alphanumeric(4).toUpperCase(),
  description: faker.helpers.arrayElement([
    'Contact Suspended',
    'Risk to Staff',
    'High RoSH',
    'Risk to Children',
    'Risk to Known Adult',
    'Risk to Prisoner',
    'Risk to Public',
  ]),
  riskFlagGroupDescription: faker.helpers.arrayElement(['Cohort', 'Public protection', 'Safeguarding Risks', 'RoSH']),
  riskNotes: faker.lorem.sentence(),
  riskNotesDetail: noteDetailFactory.buildList(faker.number.int({ min: 1, max: 3 })),
  startDate: DateFormats.dateObjToIsoDate(faker.date.past()),
}))
