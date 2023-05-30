import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { PlacementApplication } from '../../@types/shared'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<PlacementApplication>(() => ({
  id: faker.string.uuid(),
  applicationId: faker.string.uuid(),
  createdByUserId: faker.string.uuid(),
  schemaVersion: faker.string.uuid(),
  outdatedSchema: false,
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.recent()),
  submittedAt: DateFormats.dateObjToIsoDateTime(faker.date.recent()),
  data: {},
  document: {},
}))
