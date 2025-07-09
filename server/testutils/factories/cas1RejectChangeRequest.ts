import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { Cas1RejectChangeRequest } from '@approved-premises/api'

class Cas1RejectChangeRequestFactory extends Factory<Cas1RejectChangeRequest> {}

export default Cas1RejectChangeRequestFactory.define(() => ({
  rejectionReasonId: faker.string.uuid(),
  decisionJson: { notes: faker.lorem.lines(2) },
}))
