import { DateFormats, daysToWeeksAndDays } from '../dateUtils'

export const datesOfPlacementItem = (duration: number, expectedArrivalDate: string) => {
  return {
    'When will the person arrive?': DateFormats.isoDateToUIDate(expectedArrivalDate, { format: 'long' }),
    'How long should the Approved Premises placement last?': DateFormats.formatDuration(
      {
        ...daysToWeeksAndDays(duration),
      },
      ['weeks', 'days'],
    ),
  }
}
