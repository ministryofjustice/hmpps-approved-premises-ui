import { Factory } from 'fishery'
import { Cas1KeyWorkerAllocation } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'
import { userSummaryFactory } from './user'
import staffMemberFactory from './staffMember'

export default Factory.define<Cas1KeyWorkerAllocation>(({ params }) => {
  const user = userSummaryFactory.build(params.keyWorkerUser)

  return {
    keyWorker: staffMemberFactory.build({ name: user.name }),
    keyWorkerUser: user,
    allocatedAt: DateFormats.dateObjToIsoDate(faker.date.recent()),
  }
})
