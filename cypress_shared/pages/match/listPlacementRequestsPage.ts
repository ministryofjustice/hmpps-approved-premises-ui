import Page from '../page'
import paths from '../../../server/paths/match'

import { tableUtils } from '../../../server/utils/placementRequests'

import { PlacementRequest } from '../../../server/@types/shared'
import { shouldShowTableRows } from '../../helpers'

export default class ListPage extends Page {
  constructor(private readonly placementRequests: Array<PlacementRequest>) {
    super('Placement requests')
    this.placementRequests = placementRequests
  }

  static visit(placementRequests: Array<PlacementRequest>): ListPage {
    cy.visit(paths.placementRequests.index({}))
    return new ListPage(placementRequests)
  }

  shouldShowPlacementRequests(): void {
    shouldShowTableRows(this.placementRequests, tableUtils.tableRows)
  }

  clickFindBed(placementRequest: PlacementRequest): void {
    cy.get(`[data-cy-placementRequestId="${placementRequest.id}"]`).click()
  }
}
