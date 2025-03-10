import paths from '../paths/manage'
import { cas1BedDetailFactory, cas1PremisesBedSummaryFactory, userDetailsFactory } from '../testutils/factories'
import {
  actionCell,
  bedActions,
  bedDetails,
  bedLink,
  bedNameCell,
  bedTableRows,
  bedsActions,
  roomNameCell,
} from './bedUtils'

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

  describe('bedActions', () => {
    it('returns the actions menu for the bed manage page if the user has the right permission', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_out_of_service_bed_create'] })

      expect(bedActions(bedDetail, premisesId, user)).toEqual([
        {
          items: [
            {
              text: 'Create out of service bed record',
              classes: 'govuk-button--secondary',
              href: paths.outOfServiceBeds.new({ premisesId, bedId: bedDetail.id }),
            },
          ],
        },
      ])
    })

    it('returns no actions menu for the bed manage page if the user does not have the right permission', () => {
      const user = userDetailsFactory.build({ permissions: [] })

      expect(bedActions(bedDetail, premisesId, user)).toEqual([])
    })
  })

  describe('bedsActions', () => {
    it('returns an action to View out of service beds if the user has the right permission', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_view_out_of_service_beds'] })

      expect(bedsActions(premisesId, user)).toEqual([
        {
          items: [
            {
              text: 'Manage out of service beds',
              classes: 'govuk-button--secondary',
              href: paths.outOfServiceBeds.premisesIndex({ premisesId, temporality: 'current' }),
            },
          ],
        },
      ])
    })

    it('returns no action if the user does not have the right permission', () => {
      const user = userDetailsFactory.build({ permissions: [] })

      expect(bedsActions(premisesId, user)).toEqual([])
    })
  })
})
