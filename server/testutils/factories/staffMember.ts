import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { StaffMember } from '@approved-premises-shared'

export default Factory.define<StaffMember>(() => ({
  id: faker.datatype.number(),
  name: faker.name.fullName(),
}))
