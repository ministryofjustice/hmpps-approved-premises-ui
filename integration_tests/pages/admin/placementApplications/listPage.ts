import {
  Cas1ApplicationSummary,
  Cas1PlacementRequestDetail,
  Cas1PlacementRequestSummary,
  Cas1SpaceBooking,
  PlacementRequestStatus,
} from '@approved-premises/api'
import Page from '../../page'
import paths from '../../../../server/paths/admin'

import { shouldShowTableRows, tableRowsToArrays } from '../../../helpers'
import { dashboardTableRows } from '../../../../server/utils/placementRequests/table'
import { pendingPlacementRequestTableRows } from '../../../../server/utils/applications/pendingPlacementRequestTable'
import { creationNotificationBody } from '../../../../server/utils/match'

export default class ListPage extends Page {
  constructor() {
    super('CRU Dashboard')
  }

  static visit(query?: string): ListPage {
    const path = paths.admin.cruDashboard.index({})
    cy.visit(query ? `${path}?${query}` : path)
    return new ListPage()
  }

  shouldShowSpaceBookingConfirmation(spaceBooking: Cas1SpaceBooking, placementRequest: Cas1PlacementRequestDetail) {
    const body = creationNotificationBody(spaceBooking, placementRequest)
    this.shouldShowBanner(`Placement booked for ${spaceBooking.person.crn} ${body}`)
  }

  shouldShowPlacementRequests(
    placementRequests: Array<Cas1PlacementRequestSummary>,
    status?: PlacementRequestStatus,
  ): void {
    const tableRows = dashboardTableRows(placementRequests, status)
    const rowItems = tableRowsToArrays(tableRows)

    rowItems.forEach(columns => {
      const headerCell = columns.shift()
      cy.contains('th', headerCell)
        .parent('tr')
        .within(() => {
          columns.forEach((e, i) => {
            cy.get('td').eq(i).invoke('text').should('contain', e)
          })
        })
    })
  }

  shouldShowApplications(applications: Array<Cas1ApplicationSummary>): void {
    shouldShowTableRows(pendingPlacementRequestTableRows(applications))
  }

  clickPlacementRequest(placementRequest: Cas1PlacementRequestDetail): void {
    cy.get(`[data-cy-placementRequestId="${placementRequest.id}"]`).click()
  }

  shouldNotShowRequestTypeFilter(): void {
    cy.get('input[name="requestType"]').should('not.exist')
  }
}
