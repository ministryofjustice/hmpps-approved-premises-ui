import paths from '../paths/manage'
import { cas1BedDetailFactory, cas1PremisesBedSummaryFactory } from '../testutils/factories'
import { actionCell, bedActions, bedDetails, bedLink, bedNameCell, bedTableRows, roomNameCell, title } from './bedUtils'

describe('bedUtils', () => {
  const premisesId = 'premisesId'
  const bedSummary = cas1PremisesBedSummaryFactory.build()
  const bedDetail = cas1BedDetailFactory.build()

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

  describe('bedDetails', () => {
    it('returns a summary list of characteristics', () => {
      const bed = cas1BedDetailFactory.build({
        characteristics: ['hasStepFreeAccessToCommunalAreas', 'isSuitedForSexOffenders', 'isArsonSuitable'],
      })

      expect(bedDetails(bed)).toEqual({
        rows: [
          {
            key: { text: 'Characteristics' },
            value: {
              html: `<ul class="govuk-list govuk-list--bullet"><li>Suitable for active arson risk</li><li>Suitable for sexual offence risk</li></ul>`,
            },
          },
        ],
      })
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
