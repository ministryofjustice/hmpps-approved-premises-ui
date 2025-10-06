import { AppointmentSummaryDto, OffenderFullDto } from '../../server/@types/shared'
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
    const { appointmentSummaries } = mockAppointments()

    cy.get('tr')
      .eq(1)
      .within(() => {
        this.shouldShowAppointmentDetails(appointmentSummaries[0])
        this.shouldShowCorrectTimeProgress(this.expectedTimeDetails[0])
      })

    cy.get('tr')
      .eq(2)
      .within(() => {
        this.shouldShowAppointmentDetails(appointmentSummaries[1])
        this.shouldShowCorrectTimeProgress(this.expectedTimeDetails[1])
      })
  }

  shouldShowOffendersWithNoNames() {
    const { appointmentSummaries } = mockAppointments(true)

    cy.get('tr')
      .eq(1)
      .within(() => {
        this.shouldShowLimitedAppointmentDetails(appointmentSummaries[0])
        this.shouldShowCorrectTimeProgress(this.expectedTimeDetails[0])
      })

    cy.get('tr')
      .eq(2)
      .within(() => {
        this.shouldShowLimitedAppointmentDetails(appointmentSummaries[1])
        this.shouldShowCorrectTimeProgress(this.expectedTimeDetails[1])
      })
  }

  shouldNotHaveUpdateLinksForOffenders() {
    cy.get('a').contains('Update').should('not.exist')
  }

  private shouldShowAppointmentDetails(appointment: AppointmentSummaryDto) {
    const offender = appointment.offender as OffenderFullDto

    cy.get('td').eq(0).should('have.text', `${offender.forename} ${offender.surname}`)
    cy.get('td').eq(1).should('have.text', offender.crn)
    cy.get('td').eq(5).should('have.text', 'Not entered')
  }

  private shouldShowCorrectTimeProgress(expectedTime: { ordered: string; completed: string; remaining: string }) {
    cy.get('td').eq(2).should('have.text', expectedTime.ordered)
    cy.get('td').eq(3).should('have.text', expectedTime.completed)
    cy.get('td').eq(4).should('have.text', expectedTime.remaining)
  }

  private shouldShowLimitedAppointmentDetails(appointment: AppointmentSummaryDto) {
    cy.get('td').eq(1).should('have.text', appointment.offender.crn)
    cy.get('td').eq(5).should('have.text', 'Not entered')
    cy.get('td').eq(0).should('have.text', '')
  }

  private expectedTimeDetails = [
    {
      ordered: '10:00',
      completed: '8:20',
      remaining: '1:40',
    },
    {
      ordered: '15:00',
      completed: '10:00',
      remaining: '5:00',
    },
  ]
}
