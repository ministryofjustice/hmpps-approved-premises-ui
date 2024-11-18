import type { Cas1SpaceBooking, DepartureReason } from '@approved-premises/api'
import { ReferenceData } from '@approved-premises/ui'
import Page from '../../../page'
import { DateFormats } from '../../../../../server/utils/dateUtils'

import { BREACH_OR_RECALL_REASON_ID } from '../../../../../server/utils/placements'

export class BreachOrRecallPage extends Page {
  breachOrRecallReasons: Array<ReferenceData>

  constructor(
    private readonly placement: Cas1SpaceBooking,
    departureReasons: Array<DepartureReason>,
  ) {
    super('Record a departure')

    this.breachOrRecallReasons = departureReasons.filter(reason => reason.parentReasonId === BREACH_OR_RECALL_REASON_ID)
  }

  shouldShowFormAndExpectedDepartureDate(): void {
    this.shouldContainSummaryListItems([
      {
        key: { text: 'Expected departure date' },
        value: { text: DateFormats.isoDateToUIDate(this.placement.expectedDepartureDate) },
      },
    ])
    this.getLegend('Breach or recall')
  }

  completeForm() {
    this.checkRadioByNameAndValue('breachOrRecallReasonId', this.breachOrRecallReasons[1].id)
  }

  shouldShowPopulatedForm() {
    this.verifyRadioInputByName('breachOrRecallReasonId', this.breachOrRecallReasons[1].id)
  }
}
