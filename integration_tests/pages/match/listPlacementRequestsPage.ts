import Page from '../page'
import paths from '../../../server/paths/match'

import { tableUtils } from '../../../server/utils/placementRequests'

import { PlacementRequest } from '../../../server/@types/shared'
import { shouldShowTableRows } from '../../helpers'

export default class ListPage extends Page {
  constructor() {
    super('My Cases')
  }

  static visit(): ListPage {
    cy.visit(paths.placementRequests.index({}))
    return new ListPage()
  }

  shouldShowPlacementRequests(placementRequests: Array<PlacementRequest>): void {
    shouldShowTableRows(placementRequests, tableUtils.tableRows)
  }

  clickUnableToMatch(): void {
    cy.get('a').contains('Unable to match').click()
  }

  clickCompleted(): void {
    cy.get('a').contains('Completed').click()
  }

  clickActive(): void {
    cy.get('a').contains('Active cases').click()
  }

  clickFindBed(placementRequest: PlacementRequest): void {
    cy.get(`[data-cy-placementRequestId="${placementRequest.id}"]`).click()
  }
}
