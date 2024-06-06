import type { Booking, Cas1OutOfServiceBed as OutOfServiceBed, Premises } from '@approved-premises/api'
import paths from '../../../../server/paths/manage'

import Page from '../../page'
import BedspaceConflictErrorComponent from '../../../components/bedspaceConflictErrorComponent'

export class OutOfServiceBedCreatePage extends Page {
  private readonly bedspaceConflictErrorComponent: BedspaceConflictErrorComponent

  constructor(premisesId: Premises['id']) {
    super('Mark a bed as out of service')

    this.bedspaceConflictErrorComponent = new BedspaceConflictErrorComponent(premisesId, 'lost-bed')
  }

  static visit(premisesId: Premises['id'], bedId: OutOfServiceBed['id']): OutOfServiceBedCreatePage {
    cy.visit(paths.v2Manage.outOfServiceBeds.new({ premisesId, bedId }))
    return new OutOfServiceBedCreatePage(premisesId)
  }

  public completeForm(outOfServiceBed: OutOfServiceBed): void {
    const outOfServiceFrom = new Date(Date.parse(outOfServiceBed.outOfServiceFrom))
    const outOfServiceTo = new Date(Date.parse(outOfServiceBed.outOfServiceTo))

    cy.get('input[name="outOfServiceFrom-day"]').type(String(outOfServiceFrom.getDate()))
    cy.get('input[name="outOfServiceFrom-month"]').type(String(outOfServiceFrom.getMonth() + 1))
    cy.get('input[name="outOfServiceFrom-year"]').type(String(outOfServiceFrom.getFullYear()))

    cy.get('input[name="outOfServiceTo-day"]').type(String(outOfServiceTo.getDate()))
    cy.get('input[name="outOfServiceTo-month"]').type(String(outOfServiceTo.getMonth() + 1))
    cy.get('input[name="outOfServiceTo-year"]').type(String(outOfServiceTo.getFullYear()))

    if (outOfServiceBed.referenceNumber) {
      cy.get('input[name="outOfServiceBed[referenceNumber]"]').type(outOfServiceBed.referenceNumber)
    }

    if (outOfServiceBed.notes) {
      cy.get('[name="outOfServiceBed[notes]"]').type(outOfServiceBed.notes)
    }
  }

  public clickSubmit(): void {
    cy.get('[name="outOfServiceBed[submit]"]').click()
  }

  shouldShowDateConflictErrorMessages(
    conflictingEntity: Booking | OutOfServiceBed,
    conflictingEntityType: 'booking' | 'lost-bed',
  ): void {
    this.bedspaceConflictErrorComponent.shouldShowDateConflictErrorMessages(
      ['outOfServiceFrom', 'outOfServiceTo'],
      conflictingEntity,
      conflictingEntityType,
    )
  }
}
