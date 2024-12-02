import { Factory } from 'fishery'
import { NewCas1SpaceBookingCancellation } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<NewCas1SpaceBookingCancellation>(() => ({
  occurredAt: DateFormats.dateObjToIsoDate(faker.date.recent()),
  reasonId: faker.string.uuid(),
  reasonNotes: faker.lorem.words(20),
}))
