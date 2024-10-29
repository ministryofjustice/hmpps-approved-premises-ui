import type { FullPerson } from '@approved-premises/api'
import {
  cas1PremisesBasicSummaryFactory,
  cas1PremisesSummaryFactory,
  cas1SpaceBookingSummaryFactory,
} from '../../testutils/factories'
import {
  PersonWithName,
  TAB_TEXT_MAP,
  cas1PremisesSummaryRadioOptions,
  groupCas1SummaryPremisesSelectOptions,
  placementTableHeader,
  placementTableRows,
  premisesActions,
  premisesTabItems,
  premisesTableRows,
  summaryListForPremises,
} from '.'
import { textValue } from '../applications/helpers'
import paths from '../../paths/manage'
import { linkTo } from '../utils'
import { DateFormats } from '../dateUtils'

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

  describe('premisesTabItems', () => {
    it('should return a set filter tabs for the premises detail page', () => {
      const premises = cas1PremisesSummaryFactory.build()
      const expectedTabs = [
        {
          active: true,
          href: `/manage/premises/${premises.id}?activeTab=upcoming`,
          text: 'Upcoming',
        },
        {
          active: false,
          href: `/manage/premises/${premises.id}?activeTab=current`,
          text: 'Current',
        },
        {
          active: false,
          href: `/manage/premises/${premises.id}?activeTab=historic`,
          text: 'Historical',
        },
      ]
      const tabSet = premisesTabItems(premises, 'upcoming')
      expect(tabSet).toEqual(expectedTabs)
    })
  })

  describe('placementTableHeader', () => {
    it('should return the sortable table headings for the placement list', () => {
      const sortBy = 'personName'
      const tableHeadings = placementTableHeader('upcoming', sortBy, 'asc', 'Test_Href_Prefix')
      const expectedTableHeadings = [
        {
          attributes: { 'aria-sort': 'ascending', 'data-cy-sort-field': 'personName' },
          html: '<a href="Test_Href_Prefix?sortBy=personName&sortDirection=desc">Name and CRN</a>',
        },
        {
          attributes: { 'aria-sort': 'none', 'data-cy-sort-field': 'tier' },
          html: '<a href="Test_Href_Prefix?sortBy=tier">Tier</a>',
        },
        {
          attributes: { 'aria-sort': 'none', 'data-cy-sort-field': 'canonicalArrivalDate' },
          html: '<a href="Test_Href_Prefix?sortBy=canonicalArrivalDate">Arrival date</a>',
        },
        {
          attributes: { 'aria-sort': 'none', 'data-cy-sort-field': 'canonicalDepartureDate' },
          html: '<a href="Test_Href_Prefix?sortBy=canonicalDepartureDate">Departure date</a>',
        },
        {
          attributes: { 'aria-sort': 'none', 'data-cy-sort-field': 'keyWorkerName' },
          html: '<a href="Test_Href_Prefix?sortBy=keyWorkerName">Key worker</a>',
        },
      ]
      expect(tableHeadings).toEqual(expectedTableHeadings)
    })
  })
  describe('placementTableRows', () => {
    it('should return the rows of the placement summary table', () => {
      const placements = cas1SpaceBookingSummaryFactory.buildList(3, { tier: 'A' })
      const tableRows = placementTableRows('Test_Premises_Id', placements)
      const expectedRows = placements.map(placement => [
        {
          html: `<a href="/manage/premises/Test_Premises_Id/space-bookings/${placement.id}" data-cy-id="${placement.id}">${laoName(placement.person as unknown as FullPerson)}, ${placement.person.crn}</a>`,
        },
        { html: `<span class="moj-badge moj-badge--red">${placement.tier}</span>` },
        { text: DateFormats.isoDateToUIDate(placement.canonicalArrivalDate, { format: 'short' }) },
        { text: DateFormats.isoDateToUIDate(placement.canonicalDepartureDate, { format: 'short' }) },
        { text: placement.keyWorkerAllocation.keyWorker.name },
      ])
      expect(tableRows).toEqual(expectedRows)
    })
  })
})
