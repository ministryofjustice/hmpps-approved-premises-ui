import { cas1PremisesBasicSummaryFactory, cas1PremisesSummaryFactory } from '../../testutils/factories'
import {
  cas1PremisesSummaryRadioOptions,
  groupCas1SummaryPremisesSelectOptions,
  premisesActions,
  premisesTableRows,
  summaryListForPremises,
} from '.'
import { textValue } from '../applications/helpers'
import paths from '../../paths/manage'
import { linkTo } from '../utils'

describe('premisesUtils', () => {
  describe('premisesActions', () => {
    it('is exported correctly', () => {
      expect(premisesActions).toBeDefined()
    })
  })

  describe('summaryListForPremises', () => {
    it('should return a summary of a premises', () => {
      const premises = cas1PremisesSummaryFactory.build({
        apCode: '123',
        postcode: 'SW1A 1AA',
        bedCount: 20,
        availableBeds: 12,
        outOfServiceBeds: 3,
      })

      expect(summaryListForPremises(premises)).toEqual({
        rows: [
          {
            key: textValue('Code'),
            value: textValue('123'),
          },
          {
            key: textValue('Postcode'),
            value: textValue('SW1A 1AA'),
          },
          {
            key: textValue('Number of Beds'),
            value: textValue('20'),
          },
          {
            key: textValue('Available Beds'),
            value: textValue('12'),
          },
          {
            key: textValue('Out of Service Beds'),
            value: textValue('3'),
          },
        ],
      })
    })
  })

  describe('groupCas1SummaryPremisesSelectOptions', () => {
    const area1Premises = cas1PremisesBasicSummaryFactory.buildList(2, { apArea: { id: 'a1', name: 'Area 1' } })
    const area2Premises = cas1PremisesBasicSummaryFactory.buildList(2, { apArea: { id: 'a2', name: 'Area 2' } })
    const premises = [...area1Premises, ...area2Premises]

    it('should group premises by AP area', () => {
      expect(groupCas1SummaryPremisesSelectOptions(premises, {})).toEqual([
        {
          items: [
            { selected: false, text: area1Premises[0].name, value: area1Premises[0].id },
            { selected: false, text: area1Premises[1].name, value: area1Premises[1].id },
          ],
          label: 'Area 1',
        },
        {
          items: [
            { selected: false, text: area2Premises[0].name, value: area2Premises[0].id },
            { selected: false, text: area2Premises[1].name, value: area2Premises[1].id },
          ],
          label: 'Area 2',
        },
      ])
    })

    it('should select the option whose id maches the premisesId field in the context', () => {
      expect(
        groupCas1SummaryPremisesSelectOptions(premises, { premisesId: area1Premises[0].id })[0].items[0].selected,
      ).toBeTruthy()
    })
    it('should select the option whose id maches the specified field in the context', () => {
      expect(
        groupCas1SummaryPremisesSelectOptions(premises, { premises: area2Premises[1].id }, 'premises')[1].items[1]
          .selected,
      ).toBeTruthy()
    })
  })

  describe('cas1PremisesSummaryRadioOptions', () => {
    const premises = cas1PremisesBasicSummaryFactory.buildList(2)

    it('should map premises summary list into a set of radio buttons', () => {
      expect(cas1PremisesSummaryRadioOptions(premises, {})).toEqual([
        {
          text: `${premises[0].name} (${premises[0].apArea.name})`,
          value: premises[0].id,
          selected: false,
        },
        {
          text: `${premises[1].name} (${premises[1].apArea.name})`,
          value: premises[1].id,
          selected: false,
        },
      ])
    })
    it('should select the option whose id maches the specfied field in the context', () => {
      expect(
        cas1PremisesSummaryRadioOptions(premises, { premises: premises[1].id }, 'premises')[1].selected,
      ).toBeTruthy()
    })
  })

  describe('premisesTableRows', () => {
    it('returns a table view of the premises with links to the their premises pages', async () => {
      const premises1 = cas1PremisesSummaryFactory.build({ name: 'XYZ' })
      const premises2 = cas1PremisesSummaryFactory.build({ name: 'ABC' })
      const premises3 = cas1PremisesSummaryFactory.build({ name: 'GHI' })

      const premises = [premises1, premises2, premises3]

      expect(premisesTableRows(premises)).toEqual([
        [
          {
            text: premises2.name,
          },
          {
            text: premises2.apCode,
          },
          {
            text: premises2.bedCount.toString(),
          },
          {
            html: linkTo(
              paths.premises.show,
              { premisesId: premises2.id },
              { text: 'View', hiddenText: `about ${premises2.name}` },
            ),
          },
        ],
        [
          {
            text: premises3.name,
          },
          {
            text: premises3.apCode,
          },
          {
            text: premises3.bedCount.toString(),
          },
          {
            html: linkTo(
              paths.premises.show,
              { premisesId: premises3.id },
              { text: 'View', hiddenText: `about ${premises3.name}` },
            ),
          },
        ],
        [
          {
            text: premises1.name,
          },
          {
            text: premises1.apCode,
          },
          {
            text: premises1.bedCount.toString(),
          },
          {
            html: linkTo(
              paths.premises.show,
              { premisesId: premises1.id },
              { text: 'View', hiddenText: `about ${premises1.name}` },
            ),
          },
        ],
      ])
    })
  })
})
