import type { ApprovedPremisesLostBed as LostBed } from '@approved-premises/api'
import paths from '../../../server/paths/manage'

import Page from '../page'

export default class LostBedCreatePage extends Page {
  constructor() {
    super('Mark a bed as out of service')
  }

  static visit(premisesId: string): LostBedCreatePage {
    cy.visit(paths.lostBeds.new({ premisesId }))
    return new LostBedCreatePage()
  }

  public completeForm(lostBed: LostBed): void {
    const startDate = new Date(Date.parse(lostBed.startDate))
    const endDate = new Date(Date.parse(lostBed.endDate))

    cy.get('input[name="lostBed[numberOfBeds]"]').type(String(lostBed.numberOfBeds))

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
}
