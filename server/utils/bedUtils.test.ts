import paths from '../paths/manage'
import {
  apCharacteristicPairFactory,
  bedDetailFactory,
  bedOccupancyEntryBookingUiFactory,
  bedOccupancyEntryLostBedUiFactory,
  bedOccupancyEntryOverbookingUiFactory,
  bedSummaryFactory,
} from '../testutils/factories'
import {
  InvalidOverbookingDataException,
  actionCell,
  bedActions,
  bedDetails,
  bedLink,
  bedNameCell,
  bedTableRows,
  characteristicsRow,
  decodeOverbooking,
  encodeOverbooking,
  overbookingSummaryList,
  roomNameCell,
  statusCell,
  statusRow,
  title,
} from './bedUtils'
import { DateFormats } from './dateUtils'

describe('bedUtils', () => {
  const premisesId = 'premisesId'
  const bed = bedSummaryFactory.build()
  const bedDetail = bedDetailFactory.build()

  describe('roomNameCell', () => {
    it('returns the name of the room', () => {
      expect(roomNameCell(bed)).toEqual({ text: bed.roomName })
    })
  })

  describe('bedNameCell', () => {
    it('returns the name of the room', () => {
      expect(bedNameCell(bed)).toEqual({ text: bed.name })
    })
  })

  describe('statusCell', () => {
    it('returns the status of an available room in sentence case', () => {
      bed.status = 'available'

      expect(statusCell(bed)).toEqual({ text: 'Available' })
    })

    it('returns the status of an occupied room in sentence case', () => {
      bed.status = 'occupied'

      expect(statusCell(bed)).toEqual({ text: 'Occupied' })
    })

    it('returns the status of an out of service room in sentence case', () => {
      bed.status = 'out_of_service'

      expect(statusCell(bed)).toEqual({ text: 'Out of service' })
    })
  })

  describe('actionCell', () => {
    it('returns a link to manage the room', () => {
      expect(actionCell(bed, premisesId)).toEqual({
        html: bedLink(bed, premisesId),
      })
    })
  })

  describe('roomsTableRows', () => {
    it('returns the table rows given the rooms', () => {
      const beds = [bed]

      expect(bedTableRows(beds, premisesId)).toEqual([
        [roomNameCell(bed), bedNameCell(bed), statusCell(bed), actionCell(bed, premisesId)],
      ])
    })
  })

  describe('statusRow', () => {
    it('returns the status of an available room in sentence case', () => {
      bedDetail.status = 'available'

      expect(statusRow(bedDetail)).toEqual({
        key: { text: 'Status' },
        value: { text: 'Available' },
      })
    })

    it('returns the status of an occupied room in sentence case', () => {
      bedDetail.status = 'occupied'

      expect(statusRow(bedDetail)).toEqual({
        key: { text: 'Status' },
        value: { text: 'Occupied' },
      })
    })

    it('returns the status of an out of service room in sentence case', () => {
      bedDetail.status = 'out_of_service'

      expect(statusRow(bedDetail)).toEqual({
        key: { text: 'Status' },
        value: { text: 'Out of service' },
      })
    })
  })

  describe('characteristicsRow', () => {
    it('returns a list of characteristics', () => {
      bedDetail.characteristics = [
        apCharacteristicPairFactory.build({ propertyName: 'hasStepFreeAccessToCommunalAreas' }),
        apCharacteristicPairFactory.build({ propertyName: 'isSuitedForSexOffenders' }),
      ]

      expect(characteristicsRow(bedDetail)).toEqual({
        key: { text: 'Characteristics' },
        value: {
          html:
            '<ul class="govuk-list govuk-list--bullet">\n' +
            '  <li>Has step free access to communal areas</li> <li>Is suited for sex offenders</li></ul>',
        },
      })
    })
  })

  describe('bedDetails', () => {
    it('returns details for a bed', () => {
      expect(bedDetails(bedDetail)).toEqual([statusRow(bedDetail), characteristicsRow(bedDetail)])
    })
  })

  describe('title', () => {
    it('returns the title for the bed manage page', () => {
      bedDetail.name = 'Bed name'

      expect(title(bedDetail, 'Page title')).toMatchStringIgnoringWhitespace(
        '<h1 class="govuk-heading-l"><span class="govuk-caption-l">Bed name</span>Page title</h1>',
      )
    })
  })

  describe('bedActions', () => {
    it('returns the actions for the bed manage page', () => {
      expect(bedActions(bedDetail, premisesId)).toEqual({
        items: [
          {
            text: 'Mark this bed as out of service',
            classes: 'govuk-button--secondary',
            href: paths.lostBeds.new({ premisesId, bedId: bedDetail.id }),
          },
        ],
      })
    })
  })

  describe('encodeOverbooking', () => {
    it('encodes an overbooking entry to Base64', () => {
      const overbooking = bedOccupancyEntryOverbookingUiFactory.build()

      expect(encodeOverbooking(overbooking)).toEqual(Buffer.from(JSON.stringify(overbooking)).toString('base64'))
    })
  })

  describe('decodeOverbooking', () => {
    it('decodes a Base64 encoded overbooking', () => {
      const overbooking = bedOccupancyEntryOverbookingUiFactory.build()
      const encodedOverbooking = encodeOverbooking(overbooking)

      expect(decodeOverbooking(encodedOverbooking)).toEqual(overbooking)
    })

    it('throws an error if the object is not an overbooking', () => {
      const obj = Buffer.from('{"foo":"bar"}').toString('base64')

      expect(() => decodeOverbooking(obj)).toThrowError(InvalidOverbookingDataException)
    })
  })

  describe('overbookingSummaryList', () => {
    const bedId = 'bedId'

    it('returns the correct detail for a booking', () => {
      const booking = bedOccupancyEntryBookingUiFactory.build()

      expect(overbookingSummaryList(booking, premisesId, bedId)).toEqual({
        card: {
          title: {
            text: booking.personName,
          },
          actions: {
            items: [
              {
                href: paths.bookings.moves.new({ premisesId, bookingId: booking.bookingId }),
                text: 'Change allocated bed',
                visuallyHiddenText: `for ${booking.personName}`,
              },
            ],
          },
          attributes: {
            'data-cy-bookingId': booking.bookingId,
          },
        },
        rows: [
          {
            key: {
              text: 'Arrival Date',
            },
            value: {
              text: DateFormats.dateObjtoUIDate(booking.startDate),
            },
          },
          {
            key: {
              text: 'Departure Date',
            },
            value: {
              text: DateFormats.dateObjtoUIDate(booking.endDate),
            },
          },
        ],
      })
    })

    it('returns the correct detail for a lost bed', () => {
      const lostBed = bedOccupancyEntryLostBedUiFactory.build()

      expect(overbookingSummaryList(lostBed, premisesId, bedId)).toEqual({
        card: {
          title: {
            text: 'Lost Bed',
          },
          actions: {
            items: [
              {
                href: paths.lostBeds.show({ premisesId, bedId, id: lostBed.lostBedId }),
                text: 'Amend',
                visuallyHiddenText: 'lost bed entry',
              },
            ],
          },
          attributes: {
            'data-cy-lostBedId': lostBed.lostBedId,
          },
        },
        rows: [
          {
            key: {
              text: 'Arrival Date',
            },
            value: {
              text: DateFormats.dateObjtoUIDate(lostBed.startDate),
            },
          },
          {
            key: {
              text: 'Departure Date',
            },
            value: {
              text: DateFormats.dateObjtoUIDate(lostBed.endDate),
            },
          },
        ],
      })
    })
  })
})
