import { AppointmentsDto, OffenderFullDto } from '../@types/shared'
import HtmlUtils from './hmtlUtils'

export default class SessionUtils {
  static sessionListTableRows(session: AppointmentsDto) {
    return session.appointments.map(appointment => {
      const offender = appointment.offender as OffenderFullDto
      const minutesRemaining = appointment.requirementMinutes - appointment.completedMinutes
      return [
        { text: `${offender.forename} ${offender.surname}` },
        { text: appointment.offender.crn },
        { text: SessionUtils.getHours(appointment.requirementMinutes) },
        { text: SessionUtils.getHours(appointment.completedMinutes) },
        { text: SessionUtils.getHours(minutesRemaining) },
        { html: SessionUtils.getStatusTag() },
      ]
    })
  }

  private static getStatusTag() {
    return HtmlUtils.getStatusTag('Empty', 'grey')
  }

  private static getHours(minutes: number): number {
    return minutes / 60
  }
}
