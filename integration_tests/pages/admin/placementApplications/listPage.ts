import Page from '../../page'
import paths from '../../../../server/paths/admin'

import { PlacementRequest } from '../../../../server/@types/shared'
import { shouldShowTableRows } from '../../../helpers'
import { dashboardTableRows } from '../../../../server/utils/placementRequests/table'

export default class ListPage extends Page {
  constructor(private readonly placementRequests: Array<PlacementRequest>) {
    super('Placement requests')
  }

  static visit(placementRequests: Array<PlacementRequest>): ListPage {
    cy.visit(paths.admin.placementRequests.index({}))
    return new ListPage(placementRequests)
  }

  shouldShowPlacementRequests(): void {
    shouldShowTableRows(this.placementRequests, dashboardTableRows)
  }

  clickPlacementRequest(placementRequest: PlacementRequest): void {
    cy.get(`[data-cy-placementRequestId="${placementRequest.id}"]`).click()
  }
}
