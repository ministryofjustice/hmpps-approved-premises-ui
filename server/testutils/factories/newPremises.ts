import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { NewPremises } from 'approved-premises'

export default Factory.define<NewPremises>(() => ({
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  postcode: faker.address.zipCode(),
  bedCount: 50,
  service: 'temporary-accommodation',
}))
