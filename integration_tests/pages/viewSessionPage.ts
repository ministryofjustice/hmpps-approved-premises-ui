import { AppointmentDto, OffenderFullDto } from '../../server/@types/shared'
import { mockAppointments } from '../mockApis/sessions'
import paths from '../../server/paths'

import Page from './page'

export default class ViewSessionPage extends Page {
  constructor() {
    super('Park cleaning')
  }

  static visit(): ViewSessionPage {
    const path = `${paths.sessions.show({ id: '3' })}?date=2025-01-01`
    cy.visit(path)

    return Page.verifyOnPage(ViewSessionPage)
  }

  clickUpdateAnAppointment() {
    cy.get('a').contains('Update').eq(0).click()
  }

  shouldShowAppointmentsList() {
    const { appointments } = mockAppointments

    cy.get('tr')
      .eq(1)
      .within(() => {
        this.shouldShowAppointmentDetails(appointments[0])
      })

    cy.get('tr')
      .eq(2)
      .within(() => {
        this.shouldShowAppointmentDetails(appointments[1])
      })
  }

  private shouldShowAppointmentDetails(appointment: AppointmentDto) {
    const offender = appointment.offender as OffenderFullDto

    cy.get('td').eq(0).should('have.text', `${offender.forename} ${offender.surname}`)
    cy.get('td').eq(1).should('have.text', offender.crn)
    cy.get('td')
      .eq(2)
      .should('have.text', appointment.requirementMinutes / 60)
    cy.get('td')
      .eq(3)
      .should('have.text', appointment.completedMinutes / 60)
    cy.get('td')
      .eq(4)
      .should('have.text', (appointment.requirementMinutes - appointment.completedMinutes) / 60)
    cy.get('td').eq(5).should('have.text', 'Empty')
  }
}
