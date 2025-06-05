import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { OASysQuestion } from '@approved-premises/api'

export default Factory.define<OASysQuestion>(options => {
  return {
    label: [faker.word.verb(), faker.word.adjective(), faker.word.noun(), faker.word.adverb()].join(' '),
    questionNumber: options.sequence.toString(),
    answer: faker.lorem.paragraph(),
  }
})
