import { differenceInDays } from 'date-fns'
import { ApprovedPremisesApplication as Application, Cas1ApplicationTimelinessCategory } from '@approved-premises/api'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'
import { DateFormats } from '../dateUtils'

export const noticeTypeFromApplication = (application: Application): Cas1ApplicationTimelinessCategory => {
  const arrivalDateString = arrivalDateFromApplication(application)

  if (!arrivalDateString) return 'standard'

  const arrivalDateObj = DateFormats.isoToDateObj(arrivalDateString)
  const differenceInDaysToCurrentDate = differenceInDays(arrivalDateObj, new Date())

  switch (true) {
    case differenceInDaysToCurrentDate <= 7:
      return 'emergency'
    case differenceInDaysToCurrentDate <= 28:
      return 'shortNotice'
    default:
      return 'standard'
  }
}
