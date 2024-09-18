import type { Booking, LostBed } from '@approved-premises/api'
import paths from '../../../server/paths/manage'

import Page from '../page'
import BedspaceConflictErrorComponent from '../../components/bedspaceConflictErrorComponent'
import { EntityType } from '../../../server/@types/ui'

export default class LostBedCreatePage extends Page {
  private readonly bedspaceConflictErrorComponent: BedspaceConflictErrorComponent

  constructor(premisesId: string) {
    super('Mark a bed as out of service')

    this.bedspaceConflictErrorComponent = new BedspaceConflictErrorComponent(premisesId, 'lost-bed')
  }

  static visit(premisesId: string, bedId: string): LostBedCreatePage {
    cy.visit(paths.lostBeds.new({ premisesId, bedId }))
    return new LostBedCreatePage(premisesId)
  }

  public completeForm(lostBed: LostBed): void {
    const startDate = new Date(Date.parse(lostBed.startDate))
    const endDate = new Date(Date.parse(lostBed.endDate))

    cy.get('input[name="startDate-day"]').type(String(startDate.getDate()))
    cy.get('input[name="startDate-month"]').type(String(startDate.getMonth() + 1))
    cy.get('input[name="startDate-year"]').type(String(startDate.getFullYear()))

    cy.get('input[name="endDate-day"]').type(String(endDate.getDate()))
    cy.get('input[name="endDate-month"]').type(String(endDate.getMonth() + 1))
    cy.get('input[name="endDate-year"]').type(String(endDate.getFullYear()))

    cy.get('input[name="lostBed[referenceNumber]"]').type(lostBed.referenceNumber)

    cy.get(`input[name="lostBed[reason]"][value="${lostBed.reason.id}"]`).check()

    cy.get('[name="lostBed[notes]"]').type(lostBed.notes)
  }

  public clickSubmit(): void {
    cy.get('[name="lostBed[submit]"]').click()
  }

  shouldShowDateConflictErrorMessages(conflictingEntity: Booking | LostBed, conflictingEntityType: EntityType): void {
    this.bedspaceConflictErrorComponent.shouldShowDateConflictErrorMessages(
      ['startDate', 'endDate'],
      conflictingEntity,
      conflictingEntityType,
    )
  }
}
