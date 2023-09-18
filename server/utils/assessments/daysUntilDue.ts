import { AssessmentSummary } from '../../@types/shared'
import { DateFormats, addBusinessDays } from '../dateUtils'

export const daysUntilDue = (assessment: AssessmentSummary, todaysDate: Date = new Date()): number => {
  const receivedDate = DateFormats.isoToDateObj(assessment.createdAt)
  const dueDate = addBusinessDays(receivedDate, 10)

  return DateFormats.differenceInBusinessDays(dueDate, todaysDate)
}
