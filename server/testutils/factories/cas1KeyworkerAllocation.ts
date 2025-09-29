import { Factory } from 'fishery'
import { Cas1KeyWorkerAllocation } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas1KeyWorkerAllocation>(({ params }) => {
  const name = params?.name || faker.person.fullName()

  return {
    allocatedAt: DateFormats.dateObjToIsoDate(faker.date.recent()),
    emailAddress: faker.internet.email(),
    name,
    userId: faker.string.uuid(),
  }
})
