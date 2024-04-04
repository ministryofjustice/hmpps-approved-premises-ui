import { ApprovedPremisesAssessment as Assessment } from '../../../server/@types/shared'
import AssessPage from './assessPage'
import { offenceAndRiskCriteria, placementRequirementCriteria } from '../../../server/utils/placementCriteriaUtils'

export default class MatchingInformationPage extends AssessPage {
  constructor(assessment: Assessment) {
    super('Matching information', assessment, 'matching-information', 'matching-information', '')
  }

  shouldNotShowMentalHealthAps() {
    cy.get(`input[name="apType"][value="isMHAPElliottHouse"]`).should('not.exist')
    cy.get(`input[name="apType"][value="isMHAPStJosephs"]`).should('not.exist')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('apType')

    placementRequirementCriteria.forEach(requirement => {
      this.checkRadioButtonFromPageBody(requirement)
    })

    offenceAndRiskCriteria.forEach(offenceAndRiskInformationKey => {
      this.checkRadioButtonFromPageBody(offenceAndRiskInformationKey)
    })

    this.checkRadioButtonFromPageBody('lengthOfStayAgreed')

    this.completeTextInputFromPageBody('lengthOfStayDays')
    this.completeTextInputFromPageBody('lengthOfStayWeeks')

    this.completeTextInputFromPageBody('cruInformation')
  }
}
