import { Cas1ChangeRequestSortField } from '@approved-premises/api'
import { changeRequestsTableHeader, changeRequestsTableRows } from './changeRequestsUtils'
import { sortHeader } from '../sortHeader'
import { cas1ChangeRequestSummaryFactory } from '../../testutils/factories'
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
            html: `<a href="${adminPaths.admin.placementRequests.show({ id: changeRequests[0].id })}"  >John Smith, C123456</a>`,
          },
          { html: tierBadge('B3') },
          { text: '6 May 2025' },
          { text: DateFormats.isoDateToUIDate(changeRequests[0].createdAt, { format: 'short' }) },
          { text: 'Appeal' },
        ],
        [
          {
            html: `<a href="${adminPaths.admin.placementRequests.show({ id: changeRequests[1].id })}"  >Limited Access Offender, X987654</a>`,
          },
          { html: tierBadge('A1') },
          { text: '12 Jul 2025' },
          { text: DateFormats.isoDateToUIDate(changeRequests[1].createdAt, { format: 'short' }) },
          { text: 'Extension' },
        ],
        [
          {
            html: `<a href="${adminPaths.admin.placementRequests.show({ id: changeRequests[2].id })}"  >Unknown person, A333444</a>`,
          },
          { html: tierBadge('C1') },
          { text: '6 Jun 2025' },
          { text: DateFormats.isoDateToUIDate(changeRequests[2].createdAt, { format: 'short' }) },
          { text: 'Transfer' },
        ],
      ])
    })
  })
})
