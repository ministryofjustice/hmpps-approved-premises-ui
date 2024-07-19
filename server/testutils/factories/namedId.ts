import { NamedId } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

export default Factory.define<NamedId>(() => ({
  id: faker.string.uuid(),
  name: faker.lorem.word(),
}))
