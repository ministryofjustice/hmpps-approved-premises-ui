import { Cas1Assessment as Assessment } from '../../../server/@types/shared'
import AssessPage from './assessPage'
import { offenceAndRiskCriteria, placementRequirementCriteria } from '../../../server/utils/placementCriteriaUtils'
import paths from '../../../server/paths/assess'
import { THEN, WHEN } from '../../helpers'

export default class MatchingInformationPage extends AssessPage {
  constructor(assessment: Assessment) {
    super('Matching information', assessment, 'matching-information', 'matching-information', '')
  }

  static visit(assessment: Assessment): MatchingInformationPage {
    cy.visit(
      paths.assessments.pages.show({
        id: assessment.id,
        task: 'matching-information',
        page: 'matching-information',
      }),
    )
    return new MatchingInformationPage(assessment)
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

  checkPageNoDuration() {
    THEN('the page should show the no-duration content')
    cy.contains('Recommended placement length')
    cy.contains('We could not calculate the placement length automatically.')

    WHEN('I submit the page')
    this.clickSubmit()

    THEN('I should see errors')
    this.shouldShowErrorMessagesForFields(['lengthOfStay'], {
      lengthOfStay: 'Enter the recommended placement length',
    })

    WHEN('I complete the form')
    placementRequirementCriteria.forEach(requirement => {
      this.checkRadioButtonFromPageBody(requirement)
    })

    offenceAndRiskCriteria.forEach(offenceAndRiskInformationKey => {
      this.checkRadioButtonFromPageBody(offenceAndRiskInformationKey)
    })
    this.completeTextInputFromPageBody('lengthOfStayDays')
    this.completeTextInputFromPageBody('lengthOfStayWeeks')
  }
}
