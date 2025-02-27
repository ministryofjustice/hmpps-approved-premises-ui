import paths from '../paths/manage'
import { apCharacteristicPairFactory, bedDetailFactory, bedSummaryFactory } from '../testutils/factories'
import {
  actionCell,
  bedActions,
  bedDetails,
  bedLink,
  bedNameCell,
  bedTableRows,
  roomNameCell,
  statusCell,
  statusRow,
  title,
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
        html: bedLink(bed, premisesId),
      })
    })
  })

  describe('bedTableRows', () => {
    it('returns the table rows given the rooms', () => {
      const beds = [bed]

      expect(bedTableRows(beds, premisesId)).toEqual([
        [roomNameCell(bed), bedNameCell(bed), actionCell(bed, premisesId)],
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
    it('returns a list of translated characteristics', () => {
      bedDetail.characteristics = [
        apCharacteristicPairFactory.build({ propertyName: 'hasStepFreeAccessToCommunalAreas' }),
        apCharacteristicPairFactory.build({ propertyName: 'isSuitedForSexOffenders' }),
        apCharacteristicPairFactory.build({ propertyName: 'isArsonSuitable' }),
      ]

      expect(bedDetails(bedDetail)).toEqual([
        {
          key: { text: 'Characteristics' },
          value: {
            html: `<ul class="govuk-list govuk-list--bullet"><li>Suitable for active arson risk</li><li>Suitable for sexual offence risk</li></ul>`,
          },
        },
      ])
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
            text: 'Create out of service bed record',
            classes: 'govuk-button--secondary',
            href: paths.outOfServiceBeds.new({ premisesId, bedId: bedDetail.id }),
          },
        ],
      })
    })
  })
})
