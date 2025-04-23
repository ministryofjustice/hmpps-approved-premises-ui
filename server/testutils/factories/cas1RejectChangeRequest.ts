import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { Cas1RejectChangeRequest, Unit } from '@approved-premises/api'
import { ChangeRequestDecisionJson } from '@approved-premises/ui'

class Cas1RejectChangeRequestFactory extends Factory<Cas1RejectChangeRequest> {}

export default Cas1RejectChangeRequestFactory.define(() => {
  const decisionJson: ChangeRequestDecisionJson = { notes: faker.lorem.lines(2) }
  return {
    rejectionReasonId: faker.string.uuid(),
    decisionJson: decisionJson as unknown as Record<string, Unit>,
  }
})
