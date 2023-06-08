import Page from '../page'
import paths from '../../../server/paths/match'

import { tableUtils } from '../../../server/utils/placementRequests'
import { tableUtils as placementApplicationTableUtils } from '../../../server/utils/placementApplications'

import { PlacementApplicationTask, PlacementRequest, PlacementRequestTask } from '../../../server/@types/shared'
import { shouldShowTableRows } from '../../helpers'

export default class ListPage extends Page {
  constructor() {
    super('My Cases')
  }

  static visit(): ListPage {
    cy.visit(paths.placementRequests.index({}))
    return new ListPage()
  }

  shouldShowTasks(placementRequests: Array<PlacementRequestTask>): void {
    shouldShowTableRows(placementRequests, tableUtils.tableRows)
  }

  shouldShowPlacementApplicationTasks(placementApplicationTasks: Array<PlacementApplicationTask>): void {
    shouldShowTableRows(placementApplicationTasks, placementApplicationTableUtils.tableRows)
  }

  clickPlacementApplications(): void {
    cy.get('a').contains('Placement Applications').click()
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
