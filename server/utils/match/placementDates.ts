import { addDays } from 'date-fns'
import { DateFormats } from '../dateUtils'

type PlacementDates = {
  placementLength: number
  startDate: string
  endDate: string
}

export const placementDates = (startDateString: string, lengthInDays: string | number): PlacementDates => {
  const days = Number(lengthInDays)
  const startDate = DateFormats.isoToDateObj(startDateString)
  const endDate = addDays(startDate, days)

  return {
    placementLength: days,
    startDate: DateFormats.dateObjToIsoDate(startDate),
    endDate: DateFormats.dateObjToIsoDate(endDate),
  }
}
