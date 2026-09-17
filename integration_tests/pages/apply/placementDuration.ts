import { Cas1Application as Application } from '@approved-premises/api'

import ApplyPage from './applyPage'
import paths from '../../../server/paths/apply'

export default class PlacementDurationPage extends ApplyPage {
  application: Application

  constructor(application: Application, title = 'Placement length and dates') {
    super(title, application, 'move-on', 'placement-duration', paths.applications.show({ id: application.id }))
    this.application = application
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('differentDuration')
    this.completeTextInputFromPageBody('durationDays')
    this.completeTextInputFromPageBody('durationWeeks')
    this.completeTextInputFromPageBody('reason')
  }

  public checkPlacementLength(duration: string): void {
    cy.contains(`You can apply for a placement of ${duration} for this person.`)
    cy.contains(`It must not be longer than ${duration}.`)
    cy.contains('label', `No, apply for ${duration}`)
  }

  public checkPlacementDates(arrivalDate: string, departureDate: string): void {
    this.assertDefinition('Arrival date', arrivalDate)
    this.assertDefinition('Departure date', departureDate)
  }
}
