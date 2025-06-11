import { Factory } from 'fishery'
import { Cas1OASysSupportingInformationQuestionMetaData } from '@approved-premises/api'
import { faker } from '@faker-js/faker'

class OasysMetaDataFactory extends Factory<Cas1OASysSupportingInformationQuestionMetaData> {
  needsLinkedToHarm() {
    return this.params({
      inclusionOptional: false,
      oasysAnswerLinkedToHarm: true,
      oasysAnswerLinkedToReOffending: false,
    })
  }

  needsLinkedToReoffending() {
    return this.params({
      inclusionOptional: true,
      oasysAnswerLinkedToHarm: false,
      oasysAnswerLinkedToReOffending: true,
    })
  }

  needsNotLinkedToReoffending() {
    return this.params({
      inclusionOptional: true,
      oasysAnswerLinkedToHarm: false,
      oasysAnswerLinkedToReOffending: false,
    })
  }
}

export default OasysMetaDataFactory.define(() => ({
  section: faker.number.int({ min: 0, max: 20 }),
  sectionLabel: `${faker.word.verb()} ${faker.word.adjective()} ${faker.word.noun()} ${faker.word.adverb()}`,
  inclusionOptional: faker.datatype.boolean(),
  oasysAnswerLinkedToHarm: faker.datatype.boolean(),
  oasysAnswerLinkedToReOffending: faker.datatype.boolean(),
}))
