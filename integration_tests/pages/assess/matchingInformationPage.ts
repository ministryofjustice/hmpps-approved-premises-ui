import { ApprovedPremisesAssessment as Assessment } from '../../../server/@types/shared'
import AssessPage from './assessPage'
import {
  SpecialistSupportCriteria,
  offenceAndRiskOptions,
  placementRequirementOptions,
} from '../../../server/utils/placementCriteriaUtils'

export default class MatchingInformationPage extends AssessPage {
  constructor(assessment: Assessment) {
    super('Matching information', assessment, 'matching-information', 'matching-information', '')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('apType')
    ;(this.tasklistPage.body.specialistSupportCriteria as Array<SpecialistSupportCriteria>).forEach(requirement => {
      this.checkCheckboxByLabel(requirement)
    })

    Object.keys(placementRequirementOptions).forEach(requirement => {
      this.checkRadioButtonFromPageBody(requirement)
    })

    Object.keys(offenceAndRiskOptions).forEach(offenceAndRiskInformationKey => {
      this.checkRadioButtonFromPageBody(offenceAndRiskInformationKey)
    })

    this.checkRadioButtonFromPageBody('lengthOfStayAgreed')

    this.completeTextInputFromPageBody('lengthOfStayDays')
    this.completeTextInputFromPageBody('lengthOfStayWeeks')

    this.completeTextInputFromPageBody('cruInformation')
  }
}
