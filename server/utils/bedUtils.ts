import { BedDetail, BedSummary } from '@approved-premises/api'
import {
  BedOccupancyBookingEntryUi,
  BedOccupancyLostBedEntryUi,
  BedOccupancyOverbookingEntryUi,
  SummaryListItem,
  SummaryListWithCard,
  TableCell,
} from '../@types/ui'
import paths from '../paths/manage'
import { DateFormats } from './dateUtils'
import { linkTo, sentenceCase } from './utils'
import { translateCharacteristic } from './characteristicsUtils'

export class InvalidOverbookingDataException extends Error {}

export const bedNameCell = (item: { name: string }): TableCell => ({ text: item.name })

export const roomNameCell = (item: { roomName: string }): TableCell => ({ text: item.roomName })

export const statusCell = (bed: BedSummary): TableCell => ({ text: sentenceCase(bed.status) })

export const actionCell = (bed: BedSummary, premisesId: string): TableCell => ({
  html: bedLink(bed, premisesId),
})

export const bedTableRows = (beds: Array<BedSummary>, premisesId: string) => {
  return beds.map(bed => [roomNameCell(bed), bedNameCell(bed), actionCell(bed, premisesId)])
}

export const bedDetails = (bed: BedDetail): Array<SummaryListItem> => {
  return [characteristicsRow(bed)]
}

export const statusRow = (bed: BedDetail): SummaryListItem => ({
  key: { text: 'Status' },
  value: { text: sentenceCase(bed.status) },
})

export const characteristicsRow = (bed: BedDetail): SummaryListItem => ({
  key: { text: 'Characteristics' },
  value: {
    html: `<ul class="govuk-list govuk-list--bullet">
  ${bed.characteristics.map(characteristic => `<li>${translateCharacteristic(characteristic)}</li>`).join(' ')}</ul>`,
  },
})

export const title = (bed: BedDetail, pageTitle: string): string => {
  return `
  <h1 class="govuk-heading-l">
    <span class="govuk-caption-l">${bed.name}</span>
    ${pageTitle}
  </h1>
  `
}

export const bedActions = (bed: BedDetail, premisesId: string) => {
  return {
    items: [
      {
        text: 'Create out of service bed record',
        classes: 'govuk-button--secondary',
        href: paths.outOfServiceBeds.new({ premisesId, bedId: bed.id }),
      },
    ],
  }
}

export const bedLink = (bed: BedSummary, premisesId: string): string => {
  return linkTo(
    paths.premises.beds.show,
    { bedId: bed.id, premisesId },
    {
      text: 'Manage',
      hiddenText: `bed ${bed.name}`,
      attributes: { 'data-cy-bedId': bed.id },
    },
  )
}

export const encodeOverbooking = (overbooking: BedOccupancyOverbookingEntryUi): string => {
  const json = JSON.stringify(overbooking)

  return Buffer.from(json).toString('base64')
}

export const decodeOverbooking = (string: string): BedOccupancyOverbookingEntryUi => {
  const json = Buffer.from(string, 'base64').toString('utf-8')
  const obj = JSON.parse(json, (name, value) => {
    if (['startDate', 'endDate'].includes(name)) {
      return new Date(value)
    }
    return value
  })

  if ('startDate' in obj && 'endDate' in obj && 'length' in obj && 'type' in obj && 'items' in obj) {
    return obj as BedOccupancyOverbookingEntryUi
  }

  throw new InvalidOverbookingDataException()
}

export const overbookingSummaryList = (
  item: BedOccupancyBookingEntryUi | BedOccupancyLostBedEntryUi,
  premisesId: string,
  bedId: string,
): SummaryListWithCard => {
  const cardTitle = 'personName' in item ? item.personName : 'Lost Bed'
  const action =
    'bookingId' in item
      ? {
          href: paths.bookings.moves.new({ premisesId, bookingId: item.bookingId }),
          text: 'Change allocated bed',
          visuallyHiddenText: `for ${cardTitle}`,
        }
      : {
          href: paths.outOfServiceBeds.show({ premisesId, bedId, id: item.lostBedId, tab: 'details' }),
          text: 'Amend',
          visuallyHiddenText: 'lost bed entry',
        }
  const attributes =
    'bookingId' in item
      ? {
          'data-cy-bookingId': item.bookingId,
        }
      : {
          'data-cy-lostBedId': item.lostBedId,
        }

  return {
    card: {
      title: {
        text: cardTitle,
      },
      actions: {
        items: [action],
      },
      attributes,
    },
    rows: [
      {
        key: {
          text: 'Arrival Date',
        },
        value: {
          text: DateFormats.dateObjtoUIDate(item.startDate),
        },
      },
      {
        key: {
          text: 'Departure Date',
        },
        value: {
          text: DateFormats.dateObjtoUIDate(item.endDate),
        },
      },
    ],
  }
}
