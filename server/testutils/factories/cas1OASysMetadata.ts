import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Cas1OASysMetadata } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import cas1OASysSupportingInformationMetaDataFactory from './cas1OASysSupportingInformationQuestionMetaData'

class Cas1OASysMetadataFactory extends Factory<Cas1OASysMetadata> {
  oasysNotPresent() {
    return this.params({
      assessmentMetadata: {
        dateCompleted: undefined,
        dateStarted: undefined,
        hasApplicableAssessment: false,
      },
    })
  }
}

export default Cas1OASysMetadataFactory.define(() => {
  const dateCompleted = DateFormats.dateObjToIsoDateTime(faker.date.recent({ days: 5 }))
  const dateStarted = DateFormats.dateObjToIsoDateTime(faker.date.recent({ days: 5, refDate: dateCompleted }))
  return {
    supportingInformation: cas1OASysSupportingInformationMetaDataFactory.buildList(5),
    assessmentMetadata: {
      dateCompleted,
      dateStarted,
      hasApplicableAssessment: true,
    },
  } as Cas1OASysMetadata
})
