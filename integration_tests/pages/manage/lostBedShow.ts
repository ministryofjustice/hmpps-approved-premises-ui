import type { LostBed } from '@approved-premises/api'
import paths from '../../../server/paths/manage'

import Page from '../page'
import { DateFormats } from '../../../server/utils/dateUtils'

export default class LostBedShowPage extends Page {
  constructor(private readonly lostBed: LostBed) {
    super('Manage out of service bed')
  }

  static visit(premisesId: string, lostBed: LostBed): LostBedShowPage {
    cy.visit(paths.lostBeds.show({ premisesId, id: lostBed.id, bedId: lostBed.bedId }))
    return new LostBedShowPage(lostBed)
  }

  shouldShowLostBedDetail(): void {
    this.assertDefinition('Room number', this.lostBed.roomName)
    this.assertDefinition('Bed number', this.lostBed.bedName)
    this.assertDefinition('Start date', DateFormats.isoDateToUIDate(this.lostBed.startDate, { format: 'long' }))
    this.assertDefinition('End date', DateFormats.isoDateToUIDate(this.lostBed.startDate, { format: 'long' }))
    this.assertDefinition('Reason for bed being marked as lost', this.lostBed.reason.name)
    this.assertDefinition('Reference number', this.lostBed.referenceNumber)
  }

  public completeForm(endDateString: string, notes: string): void {
    super.completeDateInputs('endDate', endDateString)

    cy.get('textarea[name="notes"]').type(String(notes))
  }
}
