import { Factory } from 'fishery'
import { Cas1KeyWorkerAllocation } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'
import staffMemberFactory from './staffMember'

export default Factory.define<Cas1KeyWorkerAllocation>(() => ({
  keyWorker: staffMemberFactory.build(),
  keyWorkerUser: null,
  allocatedAt: DateFormats.dateObjToIsoDate(faker.date.recent()),
}))
