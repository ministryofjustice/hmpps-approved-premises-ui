import { apCharacteristicPairFactory, bedDetailFactory, bedSummaryFactory } from '../testutils/factories'
import {
  actionCell,
  bedDetails,
  bedNameCell,
  bedTableRows,
  characteristicsRow,
  roomNameCell,
  statusCell,
  statusRow,
} from './bedUtils'

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
        html: `<a href="/premises/${premisesId}/beds/${bed.id}" data-cy-bedId="${bed.id}">Manage <span class="govuk-visually-hidden">bed ${bed.name}</span></a>`,
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
})
