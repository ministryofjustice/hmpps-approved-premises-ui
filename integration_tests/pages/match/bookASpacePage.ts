import {
  ApType,
  Cas1SpaceBookingCharacteristic,
  Cas1SpaceCharacteristic,
  PlacementDates,
  PlacementRequestDetail,
  Premises,
} from '@approved-premises/api'
import Page from '../page'
import paths from '../../../server/paths/match'
import { createQueryString, sentenceCase } from '../../../server/utils/utils'
import { DateFormats } from '../../../server/utils/dateUtils'
import { placementDates, placementLength as placementLengthInDaysAndWeeks } from '../../../server/utils/match'
import { placementCriteriaLabels } from '../../../server/utils/placementCriteriaUtils'
import { apTypeLabels } from '../../../server/utils/apTypeLabels'

export default class BookASpacePage extends Page {
  constructor(premisesName: string) {
    super(`Book space in ${premisesName}`)
  }

  static visit(
    placementRequest: PlacementRequestDetail,
    startDate: string,
    durationDays: PlacementDates['duration'],
    premisesName: Premises['name'],
    premisesId: Premises['id'],
    apType: ApType,
    criteria: Array<Cas1SpaceBookingCharacteristic>,
  ) {
    const queryString = createQueryString({ startDate, durationDays, premisesName, premisesId, apType, criteria })
    const path = `${paths.v2Match.placementRequests.spaceBookings.new({ id: placementRequest.id })}?${queryString}`
    cy.visit(path)
    return new BookASpacePage(premisesName)
  }

  shouldShowBookingDetails(
    placementRequest: PlacementRequestDetail,
    startDate: string,
    duration: PlacementDates['duration'],
    apType: ApType,
    criteria?: Array<Cas1SpaceCharacteristic>,
  ): void {
    const { endDate, placementLength } = placementDates(startDate, duration.toString())
    cy.get('dd').contains(apTypeLabels[apType])
    cy.get('dd').contains(DateFormats.isoDateToUIDate(startDate))
    cy.get('dd').contains(DateFormats.isoDateToUIDate(endDate))
    cy.get('dd').contains(placementLengthInDaysAndWeeks(placementLength))
    cy.get('dd').contains(sentenceCase(placementRequest.gender))
    ;(criteria || []).forEach(requirement => {
      cy.get('li').contains(placementCriteriaLabels[requirement])
    })
  }
}
