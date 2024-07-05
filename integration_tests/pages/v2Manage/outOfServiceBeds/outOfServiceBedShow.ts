import paths from '../../../../server/paths/manage'

import Page from '../../page'
import { DateFormats } from '../../../../server/utils/dateUtils'
import { BedDetail, Cas1OutOfServiceBed as OutOfServiceBed, Premises } from '../../../../server/@types/shared'

export class OutOfServiceBedShowPage extends Page {
  constructor(private readonly outOfServiceBed: OutOfServiceBed) {
    super('View out of service bed record')
  }

  static visit(premisesId: Premises['id'], outOfServiceBed: OutOfServiceBed): OutOfServiceBedShowPage {
    cy.visit(
      paths.v2Manage.outOfServiceBeds.show({
        premisesId,
        id: outOfServiceBed.id,
        bedId: outOfServiceBed.bed.id,
        tab: 'details',
      }),
    )
    return new OutOfServiceBedShowPage(outOfServiceBed)
  }

  shouldShowOutOfServiceBedDetail(): void {
    const latestRevision = this.outOfServiceBed.revisionHistory[0]
    this.assertDefinition('Start date', DateFormats.isoDateToUIDate(latestRevision.startDate, { format: 'long' }))
    this.assertDefinition('End date', DateFormats.isoDateToUIDate(latestRevision.endDate, { format: 'long' }))
    this.assertDefinition('Reason', latestRevision.reason.name)
    this.assertDefinition('Reference number', latestRevision.referenceNumber)
    this.assertDefinition('Additional information', latestRevision.notes)
  }

  shouldShowCharacteristics(bed: BedDetail): void {
    bed.characteristics.forEach(characteristic => {
      cy.get('li').contains(characteristic.name)
    })
  }
}
