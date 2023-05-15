import type { LostBed } from '@approved-premises/api'
import paths from '../../../server/paths/manage'

import Page from '../page'
import { DateFormats } from '../../../server/utils/dateUtils'

export default class LostBedShowPage extends Page {
  constructor(private readonly lostBed: LostBed) {
    super('Lost bed details')
  }

  static visit(premisesId: string, lostBed: LostBed): LostBedShowPage {
    cy.visit(paths.lostBeds.show({ premisesId, id: lostBed.id, bedId: lostBed.bedId }))
    return new LostBedShowPage(lostBed)
  }

  shouldShowLostBedDetail(): void {
    this.assertDefinition('Start date', DateFormats.isoDateToUIDate(this.lostBed.startDate, { format: 'short' }))
    this.assertDefinition('End date', DateFormats.isoDateToUIDate(this.lostBed.startDate, { format: 'short' }))
    this.assertDefinition('Reason', this.lostBed.reason.name)
  }
}
