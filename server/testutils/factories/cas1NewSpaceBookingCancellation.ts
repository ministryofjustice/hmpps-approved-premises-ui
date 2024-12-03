import { Factory } from 'fishery'
import type { Cas1NewSpaceBookingCancellation } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas1NewSpaceBookingCancellation>(() => ({
  occurredAt: DateFormats.dateObjToIsoDate(faker.date.recent()),
  reasonId: faker.string.uuid(),
  reasonNotes: faker.lorem.words(20),
}))
