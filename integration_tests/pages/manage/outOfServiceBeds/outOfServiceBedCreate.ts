import type { Cas1OutOfServiceBed as OutOfServiceBed } from '@approved-premises/api'
import { EntityType } from '@approved-premises/ui'
import paths from '../../../../server/paths/manage'

import Page from '../../page'
import BedspaceConflictErrorComponent from '../../../components/bedspaceConflictErrorComponent'

export class OutOfServiceBedCreatePage extends Page {
  private readonly bedspaceConflictErrorComponent: BedspaceConflictErrorComponent

  constructor(premisesId: string) {
    super('Mark a bed as out of service')

    this.bedspaceConflictErrorComponent = new BedspaceConflictErrorComponent(premisesId, 'lost-bed')
  }

  static visit(premisesId: string, bedId: OutOfServiceBed['id']): OutOfServiceBedCreatePage {
    cy.visit(paths.outOfServiceBeds.new({ premisesId, bedId }))
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

    cy.get(`input[name="reason"][value="${outOfServiceBed.reason.id}"]`).check()

    if (outOfServiceBed.referenceNumber) {
      cy.get('input[name="referenceNumber"]').type(outOfServiceBed.referenceNumber)
    }

    cy.get('[name="notes"]').type(outOfServiceBed.notes)
  }

  shouldShowDateConflictErrorMessages(conflictingEntity: OutOfServiceBed, conflictingEntityType: EntityType): void {
    this.bedspaceConflictErrorComponent.shouldShowDateConflictErrorMessages(
      ['startDate', 'endDate'],
      conflictingEntity,
      conflictingEntityType,
    )
  }
}
