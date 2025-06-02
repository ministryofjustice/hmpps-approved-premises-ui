import { differenceInDays } from 'date-fns'
import { ApprovedPremisesApplication as Application, Cas1ApplicationTimelinessCategory } from '@approved-premises/api'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'
import { DateFormats } from '../dateUtils'

export const noticeTypeFromApplication = (application: Application): Cas1ApplicationTimelinessCategory => {
  const arrivalDateString = arrivalDateFromApplication(application)

  if (!arrivalDateString) return 'standard'

  const arrivalDateObj = DateFormats.isoToDateObj(arrivalDateString)

  const referenceDate = (application.submittedAt && DateFormats.isoToDateObj(application.submittedAt)) || new Date()
  const differenceInDaysToReferenceDate = differenceInDays(arrivalDateObj, referenceDate)

  switch (true) {
    case differenceInDaysToReferenceDate <= 7:
      return 'emergency'
    case differenceInDaysToReferenceDate <= 28:
      return 'shortNotice'
    default:
      return 'standard'
  }
}
