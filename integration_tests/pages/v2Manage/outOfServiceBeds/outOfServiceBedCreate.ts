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
    const startDate = new Date(Date.parse(outOfServiceBed.startDate))
    const endDate = new Date(Date.parse(outOfServiceBed.endDate))

    cy.get('input[name="startDate-day"]').type(String(startDate.getDate()))
    cy.get('input[name="startDate-month"]').type(String(startDate.getMonth() + 1))
    cy.get('input[name="startDate-year"]').type(String(startDate.getFullYear()))

    cy.get('input[name="endDate-day"]').type(String(endDate.getDate()))
    cy.get('input[name="endDate-month"]').type(String(endDate.getMonth() + 1))
    cy.get('input[name="endDate-year"]').type(String(endDate.getFullYear()))

    cy.get('input[name="outOfServiceBed[referenceNumber]"]').type(outOfServiceBed.referenceNumber)

    cy.get('[name="outOfServiceBed[notes]"]').type(outOfServiceBed.notes)
  }

  public clickSubmit(): void {
    cy.get('[name="outOfServiceBed[submit]"]').click()
  }

  shouldShowDateConflictErrorMessages(
    conflictingEntity: Booking | OutOfServiceBed,
    conflictingEntityType: 'booking' | 'lost-bed',
  ): void {
    this.bedspaceConflictErrorComponent.shouldShowDateConflictErrorMessages(
      ['startDate', 'endDate'],
      conflictingEntity,
      conflictingEntityType,
    )
  }
}
