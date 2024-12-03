import { ApType, PlacementDates, PlacementRequest, PlacementRequestDetail, Premises } from '@approved-premises/api'
import Page from '../page'
import {
  filterOutAPTypes,
  occupancyViewSummaryListForMatchingDetails,
  placementDates,
} from '../../../server/utils/match'
import { createQueryString } from '../../../server/utils/utils'
import paths from '../../../server/paths/match'

export default class OccupancyViewPage extends Page {
  constructor(premisesName: string) {
    super(`View spaces in ${premisesName}`)
  }

  static visit(
    placementRequest: PlacementRequestDetail,
    startDate: string,
    durationDays: PlacementDates['duration'],
    premisesName: Premises['name'],
    premisesId: Premises['id'],
    apType: ApType,
  ) {
    const queryString = createQueryString({ startDate, durationDays, premisesName, premisesId, apType })
    const path = `${paths.v2Match.placementRequests.spaceBookings.viewSpaces({ id: placementRequest.id })}?${queryString}`
    cy.visit(path)
    return new OccupancyViewPage(premisesName)
  }

  shouldShowMatchingDetails(
    totalCapacity: number,
    startDate: string,
    durationDays: number,
    placementRequest: PlacementRequest,
  ) {
    const dates = placementDates(startDate, durationDays.toString())
    const essentialCharacteristics = filterOutAPTypes(placementRequest.essentialCriteria)
    cy.get('.govuk-details').within(() => {
      this.shouldContainSummaryListItems(
        occupancyViewSummaryListForMatchingDetails(totalCapacity, dates, placementRequest, essentialCharacteristics),
      )
    })
  }
}
