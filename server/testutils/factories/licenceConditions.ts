import {
  AdditionalCondition,
  ApConditions,
  BespokeCondition,
  LicenceConditions,
  PssConditions,
  StandardCondition,
} from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

export const additionalConditionFactory = Factory.define<AdditionalCondition>(() => ({
  category: `cat:${faker.word.noun()}`,
  code: `code:${faker.word.noun()}`,
  hasImageUpload: faker.datatype.boolean(),
  id: faker.number.int({ min: 0, max: 100000 }),
  restrictions: faker.lorem.words(10),
  text: faker.lorem.paragraph(),
  type: faker.word.adjective(),
}))

export const bespokeConditionFactory = Factory.define<BespokeCondition>(() => ({
  text: faker.lorem.paragraph(),
}))

export const standardConditionFactory = Factory.define<StandardCondition>(() => ({
  code: faker.string.alphanumeric(7),
  text: faker.lorem.paragraph(),
}))

const apConditionsFactory = Factory.define<ApConditions>(() => ({
  additional: additionalConditionFactory.buildList(3),
  bespoke: bespokeConditionFactory.buildList(3),
  standard: standardConditionFactory.buildList(3),
}))

const pssConditionsFactory = Factory.define<PssConditions>(() => ({
  additional: additionalConditionFactory.buildList(3),
  standard: standardConditionFactory.buildList(3),
}))

export default Factory.define<LicenceConditions>(() => ({
  AP: apConditionsFactory.build(),
  PSS: pssConditionsFactory.build(),
}))
