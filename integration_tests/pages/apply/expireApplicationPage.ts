import { ApprovedPremisesApplication } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import paths from '../../../server/paths/apply'

import Page from '../page'
import { getApplicationSummary } from '../../../server/utils/applications/utils'
import apiPaths from '../../../server/paths/api'

const reason = faker.lorem.words(50)

export default class ExpireApplicationPage extends Page {
  constructor(private readonly application: ApprovedPremisesApplication) {
    super('Expire application')
    this.checkForBackButton(paths.applications.show({ id: application.id }))
  }

  verifySummary() {
    const summary = getApplicationSummary(this.application)
    this.shouldContainSummaryListItems(summary)
  }

  completeForm() {
    this.completeTextArea('reason', reason)
  }

  verifyApiCalled(): void {
    cy.task('verifyApiPost', apiPaths.applications.expire({ id: this.application.id })).then(body => {
      expect(body).to.deep.equal({ reason })
    })
  }
}
