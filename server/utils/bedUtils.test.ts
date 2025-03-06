import paths from '../paths/manage'
import { cas1BedDetailFactory, cas1PremisesBedSummaryFactory, userDetailsFactory } from '../testutils/factories'
import {
  actionCell,
  bedActions,
  bedDetails,
  bedLink,
  bedNameCell,
  bedsActions,
  bedsTableRows,
  roomNameCell,
} from './bedUtils'

describe('bedUtils', () => {
  const premisesId = 'premisesId'
  const bedSummary = cas1PremisesBedSummaryFactory.build()
  const bedDetail = cas1BedDetailFactory.build()

  describe('bedsActions', () => {
    it('returns the action to manage OOSB if the user has the create OOSB permission', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_out_of_service_bed_create'] })

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

    it('returns nothing if the user does not have the create OOSB permission', () => {
      const user = userDetailsFactory.build({ permissions: [] })

      expect(bedsActions(premisesId, user)).toEqual(null)
    })
  })

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

  describe('bedsTableRows', () => {
    it('returns the table rows given the rooms', () => {
      const beds = [bedSummary]

      expect(bedsTableRows(beds, premisesId)).toEqual([
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
    it('returns the actions for the bed manage page if the user has the create out of service beds permission', () => {
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

    it('returns nothing if the user does not have the create out of service beds permission', () => {
      const user = userDetailsFactory.build({ permissions: [] })

      expect(bedActions(bedDetail, premisesId, user)).toEqual(null)
    })
  })
})
