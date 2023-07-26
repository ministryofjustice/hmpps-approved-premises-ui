import Page from '../../page'
import paths from '../../../../server/paths/admin'

import { PlacementRequest } from '../../../../server/@types/shared'
import { shouldShowTableRows } from '../../../helpers'
import { dashboardTableRows } from '../../../../server/utils/placementRequests/table'

export default class ListPage extends Page {
  constructor() {
    super('Record and update placement details')
  }

  static visit(): ListPage {
    cy.visit(paths.admin.placementRequests.index({}))
    return new ListPage()
  }

  shouldShowPlacementRequests(placementRequests: Array<PlacementRequest>): void {
    shouldShowTableRows(placementRequests, dashboardTableRows)
  }

  clickPlacementRequest(placementRequest: PlacementRequest): void {
    cy.get(`[data-cy-placementRequestId="${placementRequest.id}"]`).click()
  }

  clickParoleOption(): void {
    cy.get('a.moj-sub-navigation__link').contains('Parole').click()
  }

  clickNonParoleOption(): void {
    cy.get('a.moj-sub-navigation__link').contains('Confirmed release date').click()
  }
}
