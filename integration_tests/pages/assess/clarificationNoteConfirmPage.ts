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
    cy.get('dl').within(() => {
      this.assertDefinition(
        'Name',
        application.caseManagerIsNotApplicant
          ? application.caseManagerUserDetails.name
          : application.applicantUserDetails.name,
      )
      this.assertDefinition(
        'Email',
        application.caseManagerIsNotApplicant
          ? application.caseManagerUserDetails.email
          : application.applicantUserDetails.email,
      )
      this.assertDefinition(
        'Contact number',
        application.caseManagerIsNotApplicant
          ? application.caseManagerUserDetails.telephoneNumber
          : application.applicantUserDetails.telephoneNumber,
      )
    })
  }
}
