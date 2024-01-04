import Page from '../page'
import paths from '../../../server/paths/match'

import { tableUtils } from '../../../server/utils/placementRequests'
import { tableUtils as placementApplicationTableUtils } from '../../../server/utils/placementApplications'

import { PlacementApplicationTask, PlacementRequest, PlacementRequestTask } from '../../../server/@types/shared'
import { shouldShowTableRows } from '../../helpers'

export default class ListPage extends Page {
  constructor() {
    super('Placement Requests')
    this.checkPhaseBanner('Give us your feedback')
  }

  static visit(): ListPage {
    cy.visit(paths.placementRequests.index({}))
    return new ListPage()
  }

  shouldShowTasks(placementRequests: Array<PlacementRequestTask>): void {
    shouldShowTableRows(tableUtils.tableRows(placementRequests))
  }

  shouldShowPlacementApplicationTasks(placementApplicationTasks: Array<PlacementApplicationTask>): void {
    shouldShowTableRows(placementApplicationTableUtils.tableRows(placementApplicationTasks))
  }

  clickPlacementApplications(): void {
    // Skip while work on Match is paused
    // cy.get('a').contains('Placement Applications').click()
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

  clickPersonName(name: string): void {
    cy.get('a').contains(name).click()
  }
}
