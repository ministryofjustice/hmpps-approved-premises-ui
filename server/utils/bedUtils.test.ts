import { Cas1PremisesBedSummary, Cas1SpaceCharacteristic } from '@approved-premises/api'
import paths from '../paths/manage'
import { cas1BedDetailFactory, cas1PremisesBedSummaryFactory, userDetailsFactory } from '../testutils/factories'
import {
  bedActions,
  characteristicsSummary,
  bedsActions,
  bedsTableHeader,
  bedsTableRows,
  calculateBedCounts,
  filterBedsByCharacteristics,
  generateCharacteristicsLabels,
} from './bedUtils'
import { htmlCell, textCell } from './tableUtils'
import { characteristicsBulletList } from './characteristicsUtils'

describe('bedUtils', () => {
  const premisesId = 'premisesId'
  const bedDetail = cas1BedDetailFactory.build()

  const testCharacteristics: Array<Array<Cas1SpaceCharacteristic>> = [
    ['isSingle', 'isSuitedForSexOffenders'],
    ['isSingle', 'hasEnSuite'],
    ['hasEnSuite'],
    [],
  ]
  const bedSummaries: Array<Cas1PremisesBedSummary> = testCharacteristics.map(characteristics =>
    cas1PremisesBedSummaryFactory.build({ characteristics }),
  )

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

  describe('bedsTableRows', () => {
    const bedList = cas1PremisesBedSummaryFactory
      .buildList(5)
      .sort(({ bedName: name1 }, { bedName: name2 }) =>
        name1.localeCompare(name2, 'en', { numeric: true, sensitivity: 'base' }),
      )

    it('returns the rows of the beds table', () => {
      const expected = bedList.map(bed => {
        return [
          htmlCell(
            `<a href="/manage/premises/premisesId/beds/${bed.id}" data-cy-bedId="${bed.id}"><span class="govuk-visually-hidden">bed name:</span>${bed.bedName}</a>`,
          ),
          textCell(bed.roomName),
          htmlCell(characteristicsBulletList(bed.characteristics, { classes: 'govuk-list--compact' })),
        ]
      })
      expect(bedsTableRows(bedList, premisesId)).toEqual(expected)
    })

    it('sorts the beds by bedName', () => {
      expect(bedsTableRows([...bedList].reverse(), premisesId)).toEqual(bedsTableRows(bedList, premisesId))
    })
  })

  describe('bedsTableHeader', () => {
    it('renders the beds tableheader', () => {
      expect(bedsTableHeader()).toEqual([{ text: 'Bed name' }, { text: 'Room name' }, { text: 'Room characteristics' }])
    })
  })

  describe('bedDetails', () => {
    it('returns a summary list of characteristics', () => {
      expect(characteristicsSummary(bedSummaries[0].characteristics)).toEqual({
        rows: [
          {
            key: { text: 'Characteristics' },
            value: {
              html: `<ul class="govuk-list govuk-list--bullet"><li>Single room</li><li>Suitable for sexual offence risk</li></ul>`,
            },
          },
        ],
      })
    })
  })

  describe('calculateBedCounts', () => {
    it('counts the number of each bed characteristic', () => {
      expect(calculateBedCounts(bedSummaries)).toEqual({ isSingle: 2, isSuitedForSexOffenders: 1, hasEnSuite: 2 })
    })
  })

  describe('filterBedsByCharacteristics', () => {
    it('filters a set of bed summaries by AND-ing filter characteristics', () => {
      const result = filterBedsByCharacteristics(bedSummaries, ['hasEnSuite', 'isSingle'])
      expect(result).toEqual([bedSummaries[1]])
    })
  })

  describe('generateCharacteristicsLabels', () => {
    it('generates characterstics labels including a count', () => {
      const result = generateCharacteristicsLabels({ isSingle: 2, acceptsSexOffenders: 1, hasEnSuite: 1 })
      expect(result).toEqual({ hasEnSuite: 'En-suite (1)', isSingle: 'Single room (2)' })
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
