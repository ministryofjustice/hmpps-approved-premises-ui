import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import { Cas1NewChangeRequest } from '@approved-premises/api'

const changeRequestTypes = ['placementAppeal', 'placementExtension', 'plannedTransfer'] as const

class Cas1NewChangeRequestFactory extends Factory<Cas1NewChangeRequest> {
  placementAppeal() {
    return this.params({
      type: 'placementAppeal',
    })
  }
}

export default Cas1NewChangeRequestFactory.define(() => {
  return {
    spaceBookingId: faker.string.uuid(),
    type: faker.helpers.arrayElement(changeRequestTypes),
    reasonId: faker.string.uuid(),
    requestJson: {},
  }
})
