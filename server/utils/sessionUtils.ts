import { AppointmentSummaryDto, SessionSummariesDto } from '../@types/shared'
import Offender from '../models/offender'
import paths from '../paths'
import DateTimeFormats from './dateTimeUtils'
import HtmlUtils from './hmtlUtils'
import { createQueryString } from './utils'
import { GovUKTableRow } from '../@types/user-defined'

export default class SessionUtils {
  static sessionResultTableRows(sessions: SessionSummariesDto) {
    return sessions.allocations.map(session => {
      const showPath = `${paths.sessions.show({ id: session.projectId.toString() })}?${createQueryString({ date: session.date })}`
      const projectLink = HtmlUtils.getAnchor(session.projectName, showPath)

      return [
        {
          html: `${HtmlUtils.getElementWithContent(projectLink)}${HtmlUtils.getElementWithContent(session.projectCode)}`,
        },
        { text: DateTimeFormats.isoDateToUIDate(session.date, { format: 'medium' }) },
        { text: DateTimeFormats.stripTime(session.startTime) },
        { text: DateTimeFormats.stripTime(session.endTime) },
        { text: session.numberOfOffendersAllocated },
        { text: session.numberOfOffendersWithOutcomes },
        { text: session.numberOfOffendersWithEA },
      ]
    })
  }

  static sessionListTableRows(appointmentSummaries: AppointmentSummaryDto[]) {
    return appointmentSummaries.map(appointment => {
      const offender = new Offender(appointment.offender)
      const minutesRemaining = appointment.requirementMinutes - appointment.completedMinutes

      return [
        { text: offender.name },
        { text: offender.crn },
        { text: DateTimeFormats.minutesToHoursAndMinutes(appointment.requirementMinutes) },
        { text: DateTimeFormats.minutesToHoursAndMinutes(appointment.completedMinutes) },
        { text: DateTimeFormats.minutesToHoursAndMinutes(minutesRemaining) },
        { html: SessionUtils.getStatusTag() },
        SessionUtils.getActionRow(appointment.id, offender),
      ]
    })
  }

  private static getActionRow(appointmentId: number, offender: Offender): GovUKTableRow {
    if (offender.isLimited) {
      return { text: '' }
    }

    const actionContent = `Update ${HtmlUtils.getHiddenText(offender.name)}`
    const linkHtml = HtmlUtils.getAnchor(
      actionContent,
      paths.appointments.update({ appointmentId: appointmentId.toString() }),
    )

    return { html: linkHtml }
  }

  private static getStatusTag() {
    return HtmlUtils.getStatusTag('Not entered', 'grey')
  }
}
