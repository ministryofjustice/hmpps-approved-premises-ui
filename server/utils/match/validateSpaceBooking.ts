import type { ObjectWithDateParts } from '@approved-premises/ui'
import { isBefore } from 'date-fns'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank } from '../dateUtils'

export const validateSpaceBooking = (body: ObjectWithDateParts<string>): Record<string, string> => {
  const errors: Record<string, string> = {}
  const { actualArrivalDate } = body
  if (!actualArrivalDate) {
    if (dateIsBlank(body, 'arrivalDate')) {
      errors['arrivalDate-day'] = 'You must enter an arrival date'
    } else if (!dateAndTimeInputsAreValidDates(body as ObjectWithDateParts<'arrivalDate'>, 'arrivalDate')) {
      errors['arrivalDate-day'] = 'The arrival date is an invalid date'
    }
  }
  if (dateIsBlank(body, 'departureDate')) {
    errors['departureDate-day'] = 'You must enter a departure date'
  } else if (!dateAndTimeInputsAreValidDates(body as ObjectWithDateParts<'departureDate'>, 'departureDate')) {
    errors['departureDate-day'] = 'The departure date is an invalid date'
  }

  if (!Object.keys(errors).length) {
    const { arrivalDate } = DateFormats.dateAndTimeInputsToIsoString(
      body as ObjectWithDateParts<'arrivalDate'>,
      'arrivalDate',
    )
    const { departureDate } = DateFormats.dateAndTimeInputsToIsoString(
      body as ObjectWithDateParts<'departureDate'>,
      'departureDate',
    )
    const textArrivalDate = actualArrivalDate || arrivalDate
    if (isBefore(departureDate, textArrivalDate) || departureDate === textArrivalDate) {
      errors['departureDate-day'] = 'The departure date must be after the arrival date'
    }
  }

  return errors
}
