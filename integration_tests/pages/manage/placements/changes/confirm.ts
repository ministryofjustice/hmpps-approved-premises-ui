import { Cas1Premises, Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import Page from '../../../page'
import { spaceBookingConfirmationSummaryListRows } from '../../../../../server/utils/match'
import { makeArrayOfType } from '../../../../../server/utils/utils'

export default class ChangePlacementConfirmPage extends Page {
  constructor(
    private readonly premises: Cas1Premises,
    private readonly query: {
      arrivalDate: string
      departureDate: string
      criteria: Array<string>
    },
  ) {
    super('Confirm booking changes')
  }

  shouldShowProposedChanges() {
    this.shouldContainSummaryListItems(
      spaceBookingConfirmationSummaryListRows(
        this.premises,
        this.query.arrivalDate,
        this.query.departureDate,
        makeArrayOfType<Cas1SpaceBookingCharacteristic>(this.query.criteria),
      ),
    )
  }
}
