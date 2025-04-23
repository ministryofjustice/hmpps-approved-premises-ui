import { Factory } from 'fishery'
import type { Cas1ApprovedPlacementAppeal } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas1ApprovedPlacementAppeal>(() => ({
  placementAppealChangeRequestId: faker.string.uuid(),
  occurredAt: DateFormats.dateObjToIsoDate(faker.date.recent()),
  reasonNotes: faker.lorem.lines(2),
}))
