import { DateFormats } from '../dateUtils'
import { formatDuration } from '../match'

export const datesOfPlacementItem = (duration: number, expectedArrivalDate: string, isFlexible: boolean) => {
  return {
    'When will the person arrive?': DateFormats.isoDateToUIDate(expectedArrivalDate, { format: 'long' }),
    'Is the date flexible?': { false: 'No', true: 'Yes' }[String(isFlexible)] || '',
    'How long should the Approved Premises placement last?': formatDuration(duration),
  }
}
