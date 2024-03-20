import { differenceInDays } from 'date-fns'
import { ApprovedPremisesApplication as Application, Cas1ApplicationTimelinessCategory } from '@approved-premises/api'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'
import { DateFormats } from '../dateUtils'

export const noticeTypeFromApplication = (application: Application): Cas1ApplicationTimelinessCategory => {
  const arrivalDateString = arrivalDateFromApplication(application)

  if (!arrivalDateString) return 'standard'

  const arrivalDateObj = DateFormats.isoToDateObj(arrivalDateString)

  switch (true) {
    case differenceInDays(arrivalDateObj, new Date()) <= 7:
      return 'emergency'
    case differenceInDays(arrivalDateObj, new Date()) <= 28:
      return 'shortNotice'
    default:
      return 'standard'
  }
}
