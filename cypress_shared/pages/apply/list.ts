import Page from '../page'
import paths from '../../../server/paths/apply'
import { DateFormats } from '../../../server/utils/dateUtils'
import { ApprovedPremisesApplication } from '../../../server/@types/shared'

export default class ListPage extends Page {
  constructor() {
    super('Previous applications dashboard')
  }

  static visit(): ListPage {
    cy.visit(paths.applications.index.pattern)

    return new ListPage()
  }

  shouldShowApplications(applications: Array<ApprovedPremisesApplication>): void {
    applications.forEach(application => {
      cy.contains(application.person.name)
        .should('have.attr', 'href', paths.applications.show({ id: application.id }))
        .parent()
        .parent()
        .within(() => {
          cy.get('th').eq(0).contains(application.person.name)
          cy.get('td').eq(0).contains(application.person.crn)
          cy.get('td').eq(1).contains(application.risks.tier.value.level)
          cy.get('td')
            .eq(2)
            .contains(
              DateFormats.isoDateToUIDate(application.data['basic-information']['release-date'].releaseDate, {
                format: 'short',
              }),
            )
          cy.get('td')
            .eq(3)
            .contains(DateFormats.isoDateToUIDate(application.submittedAt, { format: 'short' }))
        })
    })
  }

  clickSubmit() {
    cy.get('.govuk-button').click()
  }
}
