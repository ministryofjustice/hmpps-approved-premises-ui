import { PlacementApplication } from '../../../../server/@types/shared'
import applyPaths from '../../../../server/paths/apply'
import assessPaths from '../../../../server/paths/assess'
import Page from '../../page'

export default class ReviewApplicationPage extends Page {
  constructor() {
    super('Review information')
  }

  checkPageContents(placementApplication: PlacementApplication) {
    cy.get(`a[href="${applyPaths.applications.show({ id: placementApplication.applicationId })}"]`).contains(
      'View application',
    )
    cy.get(`a[href="${assessPaths.assessments.show({ id: placementApplication.assessmentId })}"]`).contains(
      'View assessment',
    )

    this.shouldContainSummaryListItems([
      {
        key: {
          text: 'test question 1',
        },
        value: {
          text: 'test answer 1',
        },
      },
      {
        key: {
          text: 'test question 2',
        },
        value: {
          text: 'test answer 2',
        },
      },
    ])
  }

  completeForm() {
    cy.get('label').contains(
      'Summarise any significant changes that have happened between the assessment and this placement request',
    )

    this.getTextInputByIdAndEnterDetails('summaryOfChanges', 'nothing has changed')
    this.clickSubmit()
  }
}
