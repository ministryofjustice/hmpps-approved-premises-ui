import { ApType, PlacementDates, PlacementRequestDetail, Premises } from '@approved-premises/api'
import Page from '../page'
import paths from '../../../server/paths/match'
import { createQueryString, sentenceCase } from '../../../server/utils/utils'
import { isFullPerson } from '../../../server/utils/personUtils'
import { apTypeLabels } from '../../../server/form-pages/apply/reasons-for-placement/type-of-ap/apType'
import { DateFormats } from '../../../server/utils/dateUtils'
import {
  filterOutAPTypes,
  placementDates,
  placementLength as placementLengthInDaysAndWeeks,
} from '../../../server/utils/matchUtils'
import { placementCriteriaLabels } from '../../../server/utils/placementCriteriaUtils'

export default class BookASpacePage extends Page {
  constructor(premisesName: string) {
    super(`Book space in ${premisesName}`)
  }

  static visit(
    placementRequest: PlacementRequestDetail,
    startDate: string,
    duration: PlacementDates['duration'],
    premisesName: Premises['name'],
    premisesId: Premises['id'],
    apType: ApType,
  ) {
    const queryString = createQueryString({ startDate, duration, premisesName, premisesId, apType })
    const path = `${paths.v2Match.placementRequests.spaceBookings.new({ id: placementRequest.id })}?${queryString}`
    cy.visit(path)
    return new BookASpacePage(premisesName)
  }

  shouldShowBookingDetails(
    placementRequest: PlacementRequestDetail,
    startDate: string,
    duration: PlacementDates['duration'],
    apType: ApType,
  ): void {
    const { endDate, placementLength } = placementDates(startDate, duration.toString())
    cy.get('h2').contains(isFullPerson(placementRequest.person) && placementRequest.person.name)
    cy.get('dd').contains(apTypeLabels[apType])
    cy.get('dd').contains(DateFormats.isoDateToUIDate(startDate))
    cy.get('dd').contains(DateFormats.isoDateToUIDate(endDate))
    cy.get('dd').contains(placementLengthInDaysAndWeeks(placementLength))
    cy.get('dd').contains(sentenceCase(placementRequest.gender))
    filterOutAPTypes(placementRequest.essentialCriteria).forEach(requirement => {
      cy.get('li').contains(placementCriteriaLabels[requirement])
    })
    filterOutAPTypes(placementRequest.desirableCriteria).forEach(requirement => {
      cy.get('li').contains(placementCriteriaLabels[requirement])
    })
  }
}
