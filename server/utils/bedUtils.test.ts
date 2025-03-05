import paths from '../paths/manage'
import { apCharacteristicPairFactory, bedDetailFactory, cas1PremisesBedSummaryFactory } from '../testutils/factories'
import {
  actionCell,
  bedActions,
  bedDetails,
  bedLink,
  bedNameCell,
  bedTableRows,
  roomNameCell,
  statusRow,
  title,
} from './bedUtils'

describe('bedUtils', () => {
  const premisesId = 'premisesId'
  const bedSummary = cas1PremisesBedSummaryFactory.build()
  const bedDetail = bedDetailFactory.build()

  describe('roomNameCell', () => {
    it('returns the name of the room', () => {
      expect(roomNameCell(bedSummary)).toEqual({ text: bedSummary.roomName })
    })
  })

  describe('bedNameCell', () => {
    it('returns the name of the room', () => {
      expect(bedNameCell(bedSummary)).toEqual({ text: bedSummary.bedName })
    })
  })

  describe('actionCell', () => {
    it('returns a link to manage the room', () => {
      expect(actionCell(bedSummary, premisesId)).toEqual({
        html: bedLink(bedSummary, premisesId),
      })
    })
  })

  describe('bedTableRows', () => {
    it('returns the table rows given the rooms', () => {
      const beds = [bedSummary]

      expect(bedTableRows(beds, premisesId)).toEqual([
        [roomNameCell(bedSummary), bedNameCell(bedSummary), actionCell(bedSummary, premisesId)],
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
