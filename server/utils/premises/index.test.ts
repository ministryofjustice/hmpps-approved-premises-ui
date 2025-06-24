import { Cas1OverbookingRange, Cas1SpaceBookingResidency } from '@approved-premises/api'
import { TextItem } from '@approved-premises/ui'
import { addDays } from 'date-fns'
import {
  cas1PremisesBasicSummaryFactory,
  cas1PremisesFactory,
  cas1SpaceBookingSummaryFactory,
} from '../../testutils/factories'
import {
  cas1PremisesSummaryRadioOptions,
  groupCas1SummaryPremisesSelectOptions,
  placementTableHeader,
  placementTableRows,
  premisesActions,
  premisesOverbookingSummary,
  premisesTabItems,
  premisesTableRows,
  summaryListForPremises,
} from '.'
import { canonicalDates, placementStatusHtml } from '../placements'
import { textValue } from '../applications/helpers'
import paths from '../../paths/manage'
import { linkTo } from '../utils'
import { displayName } from '../personUtils'
import { DateFormats } from '../dateUtils'
import { sortHeader } from '../sortHeader'

describe('premisesUtils', () => {
  describe('premisesActions', () => {
    it('is exported correctly', () => {
      expect(premisesActions).toBeDefined()
    })
  })

  describe('summaryListForPremises', () => {
    it('should return a summary of a premises', () => {
      const premises = cas1PremisesFactory.build({
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

    it('should not show available beds count if the premises does not support space bookings', () => {
      const premises = cas1PremisesFactory.build({
        supportsSpaceBookings: false,
      })

      const summaryList = summaryListForPremises(premises)

      expect(summaryList.rows).toHaveLength(4)
      expect(summaryList.rows.find(row => (row.key as TextItem).text === 'Available Beds')).toBeUndefined()
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

    it('should select the option whose id matches the premisesId field in the context', () => {
      expect(
        groupCas1SummaryPremisesSelectOptions(premises, { premisesId: area1Premises[0].id })[0].items[0].selected,
      ).toBeTruthy()
    })
    it('should select the option whose id matches the specified field in the context', () => {
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
    it('should select the option whose id matches the specfied field in the context', () => {
      expect(
        cas1PremisesSummaryRadioOptions(premises, { premises: premises[1].id }, 'premises')[1].selected,
      ).toBeTruthy()
    })
  })

  describe('premisesTableRows', () => {
    it('returns a table view of the premises with links to the their premises pages', async () => {
      const premises1 = cas1PremisesFactory.build({ name: 'XYZ' })
      const premises2 = cas1PremisesFactory.build({ name: 'ABC' })
      const premises3 = cas1PremisesFactory.build({ name: 'GHI' })

      const premises = [premises1, premises2, premises3]

      expect(premisesTableRows(premises)).toEqual([
        [
          {
            html: linkTo(paths.premises.show({ premisesId: premises2.id }), {
              text: premises2.name,
            }),
          },
          {
            text: premises2.apCode,
          },
          {
            text: premises2.bedCount.toString(),
            format: 'numeric',
          },
        ],
        [
          {
            html: linkTo(paths.premises.show({ premisesId: premises3.id }), {
              text: premises3.name,
            }),
          },
          {
            text: premises3.apCode,
          },
          {
            text: premises3.bedCount.toString(),
            format: 'numeric',
          },
        ],
        [
          {
            html: linkTo(paths.premises.show({ premisesId: premises1.id }), {
              text: premises1.name,
            }),
          },
          {
            text: premises1.apCode,
          },
          {
            text: premises1.bedCount.toString(),
            format: 'numeric',
          },
        ],
      ])
    })
  })

  describe('premisesTabItems', () => {
    it('should return a set filter tabs for the premises detail page', () => {
      const premises = cas1PremisesFactory.build()
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
        {
          active: false,
          href: `/manage/premises/${premises.id}?activeTab=search`,
          text: 'Search for a booking',
        },
      ]
      const tabSet = premisesTabItems(premises, 'upcoming')
      expect(tabSet).toEqual(expectedTabs)
    })
  })

  describe('placementTableHeader', () => {
    it.each(['upcoming', 'current', 'historic'])(
      'should return the sortable table headings for tab "%s" of the placement list',
      (activeTab: Cas1SpaceBookingResidency) => {
        const sortBy = 'personName'
        const tableHeadings = placementTableHeader(activeTab, sortBy, 'asc', 'Test_Href_Prefix')
        const baseTableHeadings = [
          sortHeader('Name and CRN', 'personName', 'personName', 'asc', 'Test_Href_Prefix'),
          sortHeader('Tier', 'tier', 'personName', 'asc', 'Test_Href_Prefix'),
          sortHeader('Arrival date', 'canonicalArrivalDate', 'personName', 'asc', 'Test_Href_Prefix'),
          sortHeader('Departure date', 'canonicalDepartureDate', 'personName', 'asc', 'Test_Href_Prefix'),
        ]
        const keyworkerColumn = sortHeader('Key worker', 'keyWorkerName', 'personName', 'asc', 'Test_Href_Prefix')
        const statusColumn = {
          text: 'Status',
        }
        const expectedTableHeadings =
          activeTab === 'historic'
            ? [...baseTableHeadings, statusColumn]
            : [...baseTableHeadings, keyworkerColumn, statusColumn]
        expect(tableHeadings).toEqual(expectedTableHeadings)
      },
    )
  })

  describe('placementTableRows', () => {
    it.each(['upcoming', 'current', 'historic'])(
      'should return the rows of the placement summary table for the "%s" tab',
      (activeTab: Cas1SpaceBookingResidency) => {
        const placements = [
          ...cas1SpaceBookingSummaryFactory.buildList(3, { tier: 'A' }),
          cas1SpaceBookingSummaryFactory.build({ tier: 'A' }),
          cas1SpaceBookingSummaryFactory.build({ tier: 'A', keyWorkerAllocation: undefined }),
        ]

        const tableRows = placementTableRows(activeTab, 'Test_Premises_Id', placements)
        const expectedRows = placements.map(placement => {
          const statusColumn = placementStatusHtml(placement)
          const { arrivalDate, departureDate } = canonicalDates(placement)
          const baseColumns = [
            {
              html: `<a href="/manage/premises/Test_Premises_Id/placements/${placement.id}" data-cy-id="${placement.id}">${displayName(placement.person)}, ${placement.person.crn}</a>`,
            },
            { html: `<span class="moj-badge moj-badge--red">${placement.tier}</span>` },
            { text: DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }) },
            { text: DateFormats.isoDateToUIDate(departureDate, { format: 'short' }) },
          ]
          return activeTab === 'historic'
            ? [...baseColumns, statusColumn]
            : [...baseColumns, { text: placement.keyWorkerAllocation?.keyWorker?.name || 'Not assigned' }, statusColumn]
        })
        expect(tableRows).toEqual(expectedRows)
      },
    )
  })

  describe('placementStatusHtml', () => {
    it('should render the status of the placement as html', () => {
      const placement = cas1SpaceBookingSummaryFactory
        .upcoming()
        .build({ expectedArrivalDate: DateFormats.dateObjToIsoDate(addDays(new Date(), 43)) })
      expect(placementStatusHtml(placement)).toEqual({ html: 'Upcoming' })
      expect(placementStatusHtml({ ...placement, openChangeRequestTypes: ['placementAppeal'] })).toEqual({
        html: 'Upcoming<br/>Appeal requested',
      })
      expect(
        placementStatusHtml({ ...placement, openChangeRequestTypes: ['placementAppeal', 'plannedTransfer'] }),
      ).toEqual({
        html: 'Upcoming<br/>Appeal requested<br/>Transfer requested',
      })
    })
  })

  describe('premisesOverbookingSummary', () => {
    it('Should generate the premisesOverbooking summary', () => {
      const overbookingSummary: Array<Cas1OverbookingRange> = [
        { startInclusive: '2025-03-01', endInclusive: '2025-04-01' },
        { startInclusive: '2025-10-20', endInclusive: '2025-10-28' },
        { startInclusive: '2025-10-30', endInclusive: '2025-10-30' },
      ]

      const premises = cas1PremisesFactory.build({ overbookingSummary })
      expect(premisesOverbookingSummary(premises)).toEqual([
        { duration: 32, from: '2025-03-01', to: '2025-04-01' },
        { duration: 9, from: '2025-10-20', to: '2025-10-28' },
        { duration: 1, from: '2025-10-30', to: '2025-10-30' },
      ])
    })
    it('Should generate an empty premisesOverbooking summary', () => {
      const overbookingSummary: Array<Cas1OverbookingRange> = []
      const premises = cas1PremisesFactory.build({ overbookingSummary })
      expect(premisesOverbookingSummary(premises)).toEqual([])
    })
  })
})
