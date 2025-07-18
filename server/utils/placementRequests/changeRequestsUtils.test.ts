import { Cas1ChangeRequestSortField, Cas1ChangeRequestSummary } from '@approved-premises/api'
import { changeRequestBanners, changeRequestsTableHeader, changeRequestsTableRows } from './changeRequestsUtils'
import { sortHeader } from '../sortHeader'
import { cas1ChangeRequestSummaryFactory, userDetailsFactory } from '../../testutils/factories'
import {
  fullPersonSummaryFactory,
  restrictedPersonSummaryFactory,
  unknownPersonSummaryFactory,
} from '../../testutils/factories/person'
import adminPaths from '../../paths/admin'
import { tierBadge } from '../personUtils'
import { DateFormats } from '../dateUtils'

describe('changeRequestsUtils', () => {
  describe('changeRequestsTableHeader', () => {
    it('renders the sortable headers for the change requests table', () => {
      const sortBy = 'tier'
      const sortDirection = 'asc'
      const hrefPrefix = 'http://example.com?'

      expect(changeRequestsTableHeader(sortBy, sortDirection, hrefPrefix)).toEqual([
        sortHeader<Cas1ChangeRequestSortField>('Name and CRN', 'name', sortBy, sortDirection, hrefPrefix),
        sortHeader<Cas1ChangeRequestSortField>('Tier', 'tier', sortBy, sortDirection, hrefPrefix),
        sortHeader<Cas1ChangeRequestSortField>(
          'Arrival date',
          'canonicalArrivalDate',
          sortBy,
          sortDirection,
          hrefPrefix,
        ),
        { text: 'Requested on' },
        { text: 'Change type' },
      ])
    })
  })

  describe('changeRequestsTableRows', () => {
    it('renders the table rows for the change requests table', () => {
      const changeRequests = [
        cas1ChangeRequestSummaryFactory.build({
          person: fullPersonSummaryFactory.build({ name: 'John Smith', crn: 'C123456' }),
          tier: 'B3',
          actualArrivalDate: '2025-05-06',
          type: 'placementAppeal',
        }),
        cas1ChangeRequestSummaryFactory.build({
          person: restrictedPersonSummaryFactory.build({ crn: 'X987654' }),
          tier: 'A1',
          expectedArrivalDate: '2025-07-12',
          actualArrivalDate: undefined,
          type: 'placementExtension',
        }),
        cas1ChangeRequestSummaryFactory.build({
          person: unknownPersonSummaryFactory.build({ crn: 'A333444' }),
          tier: 'C1',
          actualArrivalDate: '2025-06-06',
          type: 'plannedTransfer',
        }),
      ]

      expect(changeRequestsTableRows(changeRequests)).toEqual([
        [
          {
            html: `<a href="${adminPaths.admin.placementRequests.show({ id: changeRequests[0].placementRequestId })}">John Smith, C123456</a>`,
          },
          { html: tierBadge('B3') },
          { text: '6 May 2025' },
          { text: DateFormats.isoDateToUIDate(changeRequests[0].createdAt, { format: 'short' }) },
          { text: 'Appeal' },
        ],
        [
          {
            html: `<a href="${adminPaths.admin.placementRequests.show({ id: changeRequests[1].placementRequestId })}">Limited Access Offender, X987654</a>`,
          },
          { html: tierBadge('A1') },
          { text: '12 Jul 2025' },
          { text: DateFormats.isoDateToUIDate(changeRequests[1].createdAt, { format: 'short' }) },
          { text: 'Extension' },
        ],
        [
          {
            html: `<a href="${adminPaths.admin.placementRequests.show({ id: changeRequests[2].placementRequestId })}">Unknown person, A333444</a>`,
          },
          { html: tierBadge('C1') },
          { text: '6 Jun 2025' },
          { text: DateFormats.isoDateToUIDate(changeRequests[2].createdAt, { format: 'short' }) },
          { text: 'Transfer' },
        ],
      ])
    })
  })

  describe('changeRequestBanners', () => {
    it('should render a list of banners from open change request appeals', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_placement_appeal_assess'] })
      const placementRequestId = 'test-uuid'
      const appeals = cas1ChangeRequestSummaryFactory.buildList(2, { type: 'placementAppeal' })
      const transfers = cas1ChangeRequestSummaryFactory.buildList(2, { type: 'plannedTransfer' })
      const openChangeRequests = [...appeals, ...transfers]
      const expected = appeals.map((changeRequest: Cas1ChangeRequestSummary) => {
        return {
          link: `/admin/placement-requests/test-uuid/change-requests/${changeRequest.id}/review`,
          linkHeading: 'Review appeal',
          message: 'This placement has been appealed',
          requestType: 'appeal',
        }
      })
      expect(changeRequestBanners(placementRequestId, openChangeRequests, user)).toEqual(expected)
    })

    it(`should not show banners that the user doesn't have assess permissions on`, () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_transfer_assess'] })
      const placementRequestId = 'test-uuid'
      const openChangeRequests = cas1ChangeRequestSummaryFactory.buildList(2, { type: 'placementAppeal' })
      expect(changeRequestBanners(placementRequestId, openChangeRequests, user)).toEqual([])
    })
  })
})
