import { ApprovedPremisesApplication } from '@approved-premises/api'

import Page from '../page'

export default class SufficientInformationPage extends Page {
  constructor() {
    super('How to get further information')
  }

  clickBackToDashboard() {
    return cy.get('a').contains('Return to dashboard').click()
  }

  confirmUserDetails(application: ApprovedPremisesApplication) {
    cy.get('h2').contains(
      application.caseManagerIsNotApplicant ? 'Applicant details' : 'Case manager and applicant details',
    )

    if (application.caseManagerIsNotApplicant) {
      cy.get('dl')
        .first()
        .within(() => {
          this.assertDefinition('Name', application.applicantUserDetails.name)
          this.assertDefinition('Email', application.applicantUserDetails.email)
          this.assertDefinition('Contact number', application.applicantUserDetails.telephoneNumber)
        })

      cy.get('dl')
        .last()
        .within(() => {
          this.assertDefinition('Name', application.caseManagerUserDetails.name)
          this.assertDefinition('Email', application.caseManagerUserDetails.email)
          this.assertDefinition('Contact number', application.caseManagerUserDetails.telephoneNumber)
        })
    } else {
      cy.get('dl').within(() => {
        this.assertDefinition('Name', application.applicantUserDetails.name)
        this.assertDefinition('Email', application.applicantUserDetails.email)
        this.assertDefinition('Contact number', application.applicantUserDetails.telephoneNumber)
      })
    }
  }
}
