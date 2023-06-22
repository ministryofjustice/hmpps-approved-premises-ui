import { BedDetail } from '../../../../server/@types/shared'

import Page from '../../page'
import paths from '../../../../server/paths/manage'

export default class MoveBedPage extends Page {
  constructor() {
    super('Move person to a new bed')
  }

  static visit(premisesId: string, bookingId: string): MoveBedPage {
    cy.visit(paths.bookings.moves.new({ premisesId, bookingId }))
    return new MoveBedPage()
  }

  completeForm(bed: BedDetail): void {
    this.getSelectInputByIdAndSelectAnEntry('bed', bed.id)
    this.completeTextArea('notes', 'Test notes')
  }
}
