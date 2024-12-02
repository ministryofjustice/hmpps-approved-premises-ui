import { Factory } from 'fishery'
import { Cas1KeyWorkerAllocation } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import staffMemberFactory from './staffMember'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas1KeyWorkerAllocation>(() => ({
  keyWorker: staffMemberFactory.build(),
  allocatedAt: DateFormats.dateObjToIsoDate(faker.date.recent()),
}))
