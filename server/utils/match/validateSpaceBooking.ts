import type { ObjectWithDateParts } from '@approved-premises/ui'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank, datetimeIsInThePast } from '../dateUtils'

export const validateSpaceBooking = (body: ObjectWithDateParts<string>): Record<string, string> => {
  const errors: Record<string, string> = {}
  if (dateIsBlank(body, 'arrivalDate')) {
    errors.arrivalDate = 'You must enter an arrival date'
    return errors
  }
  if (!dateAndTimeInputsAreValidDates(body as ObjectWithDateParts<'arrivalDate'>, 'arrivalDate')) {
    errors.arrivalDate = 'The arrival date is an invalid date'
    return errors
  }
  if (dateIsBlank(body, 'departureDate')) {
    errors.departureDate = 'You must enter a departure date'
    return errors
  }
  if (!dateAndTimeInputsAreValidDates(body as ObjectWithDateParts<'departureDate'>, 'departureDate')) {
    errors.departureDate = 'The departure date is an invalid date'
    return errors
  }
  const { arrivalDate } = DateFormats.dateAndTimeInputsToIsoString(
    body as ObjectWithDateParts<'arrivalDate'>,
    'arrivalDate',
  )
  const { departureDate } = DateFormats.dateAndTimeInputsToIsoString(
    body as ObjectWithDateParts<'departureDate'>,
    'departureDate',
  )
  if (datetimeIsInThePast(departureDate, arrivalDate) || departureDate === arrivalDate) {
    errors.departureDate = 'The departure date must be after the arrival date'
  }
  return errors
}
