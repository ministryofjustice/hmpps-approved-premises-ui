import { DateFormats } from '../dateUtils'

export const datesOfPlacementItem = (duration: number, expectedArrivalDate: string, isFlexible: boolean) => {
  return {
    'When will the person arrive?': DateFormats.isoDateToUIDate(expectedArrivalDate, { format: 'long' }),
    'Is the date flexible?': isFlexible ? 'Yes' : 'No',
    'How long should the Approved Premises placement last?': DateFormats.formatDuration(duration),
  }
}
