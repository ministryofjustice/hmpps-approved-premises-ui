import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { StaffMember } from '@approved-premises/api'

class StaffMemberFactory extends Factory<StaffMember> {
  keyworker() {
    return this.params({
      keyWorker: true,
    })
  }
}

export default StaffMemberFactory.define(() => ({
  name: faker.person.fullName(),
  code: faker.string.uuid(),
  keyWorker: faker.datatype.boolean(),
}))
