import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1ReferenceData } from '@approved-premises/ui'

import { Cas1CruManagementArea } from '@approved-premises/api'
import outOfServiceBedReasonsJson from '../referenceData/stubs/cas1/out-of-service-bed-reasons.json'

class Cas1ReferenceDataFactory extends Factory<Cas1ReferenceData> {
  outOfServiceBedReason() {
    const data = faker.helpers.arrayElement(outOfServiceBedReasonsJson)
    return this.params(data)
  }
}

export default Cas1ReferenceDataFactory.define(() => ({
  id: faker.string.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  isActive: true,
}))

export const cruManagementAreaFactory = Factory.define<Cas1CruManagementArea>(({ sequence }) => ({
  id: faker.string.uuid(),
  name: `${faker.location.city()}${sequence}`,
}))
