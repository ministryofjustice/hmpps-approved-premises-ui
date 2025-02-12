import type { Cas1Premises, Cas1SpaceBookingCharacteristic, PlacementRequestDetail } from '@approved-premises/api'
import { differenceInDays } from 'date-fns'
import Page from '../page'
import { DateFormats, daysToWeeksAndDays } from '../../../server/utils/dateUtils'
import { requirementsHtmlString } from '../../../server/utils/match'
import { allReleaseTypes } from '../../../server/utils/applications/releaseTypeUtils'

export default class BookASpacePage extends Page {
  constructor() {
    super(`Confirm booking`)
  }

  shouldShowBookingDetails(
    placementRequest: PlacementRequestDetail,
    premises: Cas1Premises,
    arrivalDate: string,
    departureDate: string,
    criteria: Array<Cas1SpaceBookingCharacteristic>,
  ): void {
    this.shouldContainSummaryListItems([
      { key: { text: 'Approved Premises' }, value: { text: premises.name } },
      { key: { text: 'Address' }, value: { text: `${premises.fullAddress}, ${premises.postcode}` } },
      { key: { text: 'Room criteria' }, value: { html: requirementsHtmlString(criteria) } },
      { key: { text: 'Arrival date' }, value: { text: DateFormats.isoDateToUIDate(arrivalDate) } },
      { key: { text: 'Departure date' }, value: { text: DateFormats.isoDateToUIDate(departureDate) } },
      {
        key: { text: 'Length of stay' },
        value: { text: DateFormats.formatDuration(daysToWeeksAndDays(differenceInDays(departureDate, arrivalDate))) },
      },
      { key: { text: 'Release type' }, value: { text: allReleaseTypes[placementRequest.releaseType] } },
    ])
  }
}
