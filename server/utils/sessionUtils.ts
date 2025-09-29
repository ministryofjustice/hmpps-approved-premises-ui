import { AppointmentsDto, OffenderFullDto, ProjectAllocationsDto } from '../@types/shared'
import DateFormats from './dateUtils'
import HtmlUtils from './hmtlUtils'

export default class SessionUtils {
  static sessionResultTableRows(sessions: ProjectAllocationsDto) {
    return sessions.allocations.map(session => {
      return [
        {
          html: `${HtmlUtils.getElementWithContent(session.projectName)}${HtmlUtils.getElementWithContent(session.projectCode)}`,
        },
        { text: DateFormats.isoDateToUIDate(session.date, { format: 'medium' }) },
        { text: DateFormats.stripTime(session.startTime) },
        { text: DateFormats.stripTime(session.endTime) },
        { text: session.numberOfOffendersAllocated },
        { text: session.numberOfOffendersWithOutcomes },
        { text: session.numberOfOffendersWithEA },
      ]
    })
  }

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
