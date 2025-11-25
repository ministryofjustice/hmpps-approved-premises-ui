import { subMonths } from 'date-fns'
import { Cas1Application } from '../../@types/shared'
import { DateFormats } from '../dateUtils'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'

export const startDateOutsideOfNationalStandardsTimescales = (application: Cas1Application) => {
  const arrivalDateString = arrivalDateFromApplication(application)

  if (!arrivalDateString) {
    return false
  }

  const arrivalDate = DateFormats.isoToDateObj(arrivalDateString)
  const today = new Date()

  return subMonths(arrivalDate, 6) < today
}
