import { Cas1PremisesNewLocalRestriction } from '@approved-premises/api'
import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'

export default Factory.define<Cas1PremisesNewLocalRestriction>(() => ({
  description: faker.word.words({ count: { min: 1, max: 5 } }),
}))
