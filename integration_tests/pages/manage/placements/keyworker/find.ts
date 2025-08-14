import { Cas1SpaceBooking, UserSummary } from '@approved-premises/api'
import Page from '../../../page'
import paths from '../../../../../server/paths/manage'
import { keyworkersTableRows } from '../../../../../server/utils/placements/keyworkers'

export class FindAKeyworkerPage extends Page {
  constructor(readonly placement: Cas1SpaceBooking) {
    super('Find a keyworker')

    this.checkForBackButton(
      paths.premises.placements.keyworker.new({
        premisesId: placement.premises.id,
        placementId: placement.id,
      }),
    )
  }

  completeForm(searchQuery: string) {
    this.clearInput('nameOrEmail')
    this.completeTextInput('nameOrEmail', searchQuery)
    this.clickButton('Search')
  }

  shouldShowResults(availableKeyworkers: Array<UserSummary>) {
    this.shouldContainTableColumns(['Name', 'Email', 'Action'])
    this.shouldContainTableRows(keyworkersTableRows(availableKeyworkers))
  }

  shouldShowNoResults(searchQuery: string) {
    cy.get('p').contains(`There are no results matching '${searchQuery}'`)
  }

  clickAssignKeyworker(name: string) {
    cy.contains('tr', name).find('button').contains('Assign keyworker').click()
  }
}
