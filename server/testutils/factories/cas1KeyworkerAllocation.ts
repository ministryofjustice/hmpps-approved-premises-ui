import { Factory } from 'fishery'
import { Cas1KeyWorkerAllocation } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'
import { userSummaryFactory } from './user'

export default Factory.define<Cas1KeyWorkerAllocation>(() => ({
  keyWorker: undefined,
  keyWorkerUser: userSummaryFactory.build(),
  allocatedAt: DateFormats.dateObjToIsoDate(faker.date.recent()),
}))
