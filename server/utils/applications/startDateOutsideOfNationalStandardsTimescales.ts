import { subMonths } from 'date-fns'
import { ApprovedPremisesApplication } from '../../@types/shared'
import { DateFormats } from '../dateUtils'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'

export const startDateOutsideOfNationalStandardsTimescales = (application: ApprovedPremisesApplication) => {
  const arrivalDate = DateFormats.isoToDateObj(arrivalDateFromApplication(application))
  const today = new Date()

  return subMonths(arrivalDate, 6) < today
}
