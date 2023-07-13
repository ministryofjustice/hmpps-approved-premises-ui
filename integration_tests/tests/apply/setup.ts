import { updateApplicationReleaseDate } from '../../helpers'
import {
  activeOffenceFactory,
  applicationFactory,
  personFactory,
  risksFactory,
  tierEnvelopeFactory,
} from '../../../server/testutils/factories'

export const setup = () => {
  cy.task('reset')
  cy.task('stubSignIn')
  cy.task('stubAuthUser')

  // Given I am logged in
  cy.signIn()

  cy.fixture('applicationData.json').then(applicationData => {
    const person = personFactory.build()
    const application = applicationFactory.build({ person, status: 'inProgress' })
    const risks = risksFactory.build({
      crn: person.crn,
      tier: tierEnvelopeFactory.build({ value: { level: 'A3' } }),
    })
    const offences = activeOffenceFactory.buildList(1)
    application.data = updateApplicationReleaseDate(applicationData)
    application.risks = risks

    cy.wrap(person).as('person')
    cy.wrap(offences).as('offences')
    cy.wrap(application).as('application')
    cy.wrap(application.data).as('applicationData')
  })
}
