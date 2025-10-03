import { AppointmentsDto, OffenderFullDto, ProjectAllocationsDto } from '../@types/shared'
import paths from '../paths'
import DateFormats from './dateUtils'
import HtmlUtils from './hmtlUtils'
import { createQueryString } from './utils'

export default class SessionUtils {
  static sessionResultTableRows(sessions: ProjectAllocationsDto) {
    return sessions.allocations.map(session => {
      const showPath = `${paths.sessions.show({ id: session.projectId.toString() })}?${createQueryString({ date: session.date })}`
      const projectLink = HtmlUtils.getAnchor(session.projectName, showPath)

      return [
        {
          html: `${HtmlUtils.getElementWithContent(projectLink)}${HtmlUtils.getElementWithContent(session.projectCode)}`,
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
      const offenderName = `${offender.forename} ${offender.surname}`
      const minutesRemaining = appointment.requirementMinutes - appointment.completedMinutes
      const actionContent = `Update ${HtmlUtils.getHiddenText(offenderName)}`

      return [
        { text: offenderName },
        { text: appointment.offender.crn },
        { text: SessionUtils.getHours(appointment.requirementMinutes) },
        { text: SessionUtils.getHours(appointment.completedMinutes) },
        { text: SessionUtils.getHours(minutesRemaining) },
        { html: SessionUtils.getStatusTag() },
        {
          html: HtmlUtils.getAnchor(
            actionContent,
            paths.appointments.update({ appointmentId: appointment.id.toString() }),
          ),
        },
      ]
    })
  }

  private static getStatusTag() {
    return HtmlUtils.getStatusTag('Not entered', 'grey')
  }

  private static getHours(minutes: number): number {
    return minutes / 60
  }
}
