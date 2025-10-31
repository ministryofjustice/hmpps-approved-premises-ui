import type {
  Cas1PlacementRequestDetail,
  Cas1Premises,
  Cas1PremisesSearchResultSummary,
  Cas1SpaceBookingCharacteristic,
  TransferReason,
} from '@approved-premises/api'
import Page from '../page'
import { DateFormats } from '../../../server/utils/dateUtils'
import { allReleaseTypes } from '../../../server/utils/applications/releaseTypeUtils'
import { characteristicsBulletList } from '../../../server/utils/characteristicsUtils'
import { newPlacementReasons } from '../../../server/utils/match'

export default class BookASpacePage extends Page {
  constructor() {
    super(`Confirm booking`)
  }

  shouldShowBookingDetails(
    placementRequest: Cas1PlacementRequestDetail,
    premises: Cas1Premises | Cas1PremisesSearchResultSummary,
    arrivalDate: string,
    departureDate: string,
    criteria: Array<Cas1SpaceBookingCharacteristic>,
    reason?: TransferReason,
    notes?: string,
  ): void {
    this.shouldContainSummaryListItems(
      [
        { key: { text: 'Approved Premises' }, value: { text: premises.name } },
        { key: { text: 'Address' }, value: { text: `${premises.fullAddress}, ${premises.postcode}` } },
        {
          key: { text: 'Room criteria' },
          value: {
            html: characteristicsBulletList(criteria, { noneText: 'No room criteria' }),
          },
        },
        { key: { text: 'Expected arrival date' }, value: { text: DateFormats.isoDateToUIDate(arrivalDate) } },
        { key: { text: 'Expected departure date' }, value: { text: DateFormats.isoDateToUIDate(departureDate) } },
        {
          key: { text: 'Length of stay' },
          value: { text: DateFormats.durationBetweenDates(departureDate, arrivalDate).ui },
        },
        { key: { text: 'Release type' }, value: { text: allReleaseTypes[placementRequest.releaseType] } },
        reason ? { key: { text: 'Reason for placement' }, value: { text: newPlacementReasons[reason] } } : undefined,
        notes ? { key: { text: 'Additional information' }, value: { text: notes } } : undefined,
      ].filter(Boolean),
    )
  }
}
