import { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import { differenceInDays, differenceInCalendarMonths } from 'date-fns'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'
import { DateFormats } from '../dateUtils'

type ApplicationType = 'emergency' | 'short_notice' | 'standard'

export const noticeTypeFromApplication = (application: Application): ApplicationType => {
  const arrivalDate = DateFormats.isoToDateObj(arrivalDateFromApplication(application))

  switch (true) {
    case differenceInDays(arrivalDate, new Date()) < 7:
      return 'emergency'
    case differenceInCalendarMonths(arrivalDate, new Date()) < 4:
      return 'short_notice'
    default:
      return 'standard'
  }
}
