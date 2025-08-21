import { PlacementRequestSortField, PlacementRequestStatus } from '@approved-premises/api'
import { cas1PlacementRequestSummaryFactory, restrictedPersonFactory } from '../../testutils/factories'
import { dashboardTableHeader, dashboardTableRows, durationCell, nameCell } from './table'
import { DateFormats } from '../dateUtils'
import { htmlCell, textCell } from '../tableUtils'
import { sortHeader } from '../sortHeader'
import { displayName, tierBadge } from '../personUtils'
import * as utils from '../utils'
import adminPaths from '../../paths/admin'
import { fullPersonFactory } from '../../testutils/factories/person'
import { placementRequestStatus } from '../formUtils'

describe('tableUtils', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('nameCell', () => {
    beforeEach(() => {
      jest.spyOn(utils, 'linkTo')
    })

    it('returns the name and CRN of the person with a link to the placement request if the person is a Full Person', () => {
      const placementRequest = cas1PlacementRequestSummaryFactory.build({
        person: fullPersonFactory.build(),
      })

      nameCell(placementRequest)

      expect(utils.linkTo).toHaveBeenCalledWith(
        adminPaths.admin.placementRequests.show({ placementRequestId: placementRequest.id }),
        {
          text: `${displayName(placementRequest.person)}, ${placementRequest.person.crn}`,
          attributes: {
            'data-cy-placementRequestId': placementRequest.id,
            'data-cy-applicationId': placementRequest.applicationId,
          },
        },
      )
    })

    it("returns 'LAO:' and CRN with no link if the person is a restrictedPerson", () => {
      const restrictedPersonPlacementRequest = cas1PlacementRequestSummaryFactory.build({
        person: restrictedPersonFactory.build({ crn: 'K888666' }),
      })

      expect(nameCell(restrictedPersonPlacementRequest)).toEqual({
        text: `LAO: K888666`,
      })
    })

    it('returns the crn cell with no link if the person is a unknown person', () => {
      const unknownPersonPlacementRequest = cas1PlacementRequestSummaryFactory.build({
        person: restrictedPersonFactory.build({ type: 'UnknownPerson' }),
      })

      expect(nameCell(unknownPersonPlacementRequest)).toEqual({
        text: `Unknown: ${unknownPersonPlacementRequest.person.crn}`,
      })
    })
  })

  describe('durationCell', () => {
    it('returns a formatted duration', () => {
      expect(durationCell(16)).toEqual({
        text: '2 weeks, 2 days',
      })
    })
  })

  describe('dashboardTableRows', () => {
    const factories = {
      notMatched: cas1PlacementRequestSummaryFactory.notMatched(),
      unableToMatch: cas1PlacementRequestSummaryFactory.unableToMatch(),
      matched: cas1PlacementRequestSummaryFactory.matched(),
    }

    it.each(['notMatched', 'unableToMatch'])(
      'returns table rows for placement requests with status %s',
      (status: PlacementRequestStatus) => {
        const placementRequest = factories[status].build({
          placementRequestStatus: status,
          isParole: true,
        })

        expect(dashboardTableRows([placementRequest], status)).toEqual([
          [
            nameCell(placementRequest),
            htmlCell(tierBadge(placementRequest.personTier)),
            textCell('Parole'),
            textCell(DateFormats.isoDateToUIDate(placementRequest.applicationSubmittedDate, { format: 'short' })),
            textCell(DateFormats.isoDateToUIDate(placementRequest.requestedPlacementArrivalDate, { format: 'short' })),
            durationCell(placementRequest.requestedPlacementDuration),
          ],
        ])
      },
    )

    it('returns table rows for matched placement requests', () => {
      const placementRequest = factories.matched.build({ isParole: true })

      expect(dashboardTableRows([placementRequest], 'matched')).toEqual([
        [
          nameCell(placementRequest),
          htmlCell(tierBadge(placementRequest.personTier)),
          textCell('Parole'),
          textCell(DateFormats.isoDateToUIDate(placementRequest.firstBookingArrivalDate, { format: 'short' })),
          textCell(placementRequest.firstBookingPremisesName),
        ],
      ])
    })

    it.each(['notMatched', 'unableToMatch', 'matched'])(
      'returns the request type as Standard release if the placement request is not of type parole',
      (status: PlacementRequestStatus) => {
        const placementRequest = factories[status].build({
          placementRequestStatus: status,
          isParole: false,
        })

        expect(dashboardTableRows([placementRequest], status)[0][2]).toEqual(textCell('Standard release'))
      },
    )

    it('returns table rows for the search tab', () => {
      const placementRequest = cas1PlacementRequestSummaryFactory.build({ isParole: true })

      expect(dashboardTableRows([placementRequest], undefined)).toEqual([
        [
          nameCell(placementRequest),
          htmlCell(tierBadge(placementRequest.personTier)),
          textCell('Parole'),
          textCell(DateFormats.isoDateToUIDate(placementRequest.applicationSubmittedDate, { format: 'short' })),
          textCell(DateFormats.isoDateToUIDate(placementRequest.requestedPlacementArrivalDate, { format: 'short' })),
          durationCell(placementRequest.requestedPlacementDuration),
          textCell(placementRequestStatus[placementRequest.placementRequestStatus]),
        ],
      ])
    })
  })

  describe('dashboardTableHeader', () => {
    const sortBy = 'duration'
    const sortDirection = 'asc'
    const hrefPrefix = 'http://example.com'

    it.each(['notMatched', 'unableToMatch'])(
      'returns the table headers for the %s status',
      (status: PlacementRequestStatus) => {
        expect(dashboardTableHeader(status, sortBy, sortDirection, hrefPrefix)).toEqual([
          sortHeader<PlacementRequestSortField>('Name and CRN', 'person_name', sortBy, sortDirection, hrefPrefix),
          sortHeader<PlacementRequestSortField>('Tier', 'person_risks_tier', sortBy, sortDirection, hrefPrefix),
          sortHeader<PlacementRequestSortField>('Request type', 'request_type', sortBy, sortDirection, hrefPrefix),
          sortHeader<PlacementRequestSortField>(
            'Application date',
            'application_date',
            sortBy,
            sortDirection,
            hrefPrefix,
          ),
          sortHeader<PlacementRequestSortField>(
            'Requested arrival date',
            'expected_arrival',
            sortBy,
            sortDirection,
            hrefPrefix,
          ),
          sortHeader<PlacementRequestSortField>('Length of stay', 'duration', sortBy, sortDirection, hrefPrefix),
        ])
      },
    )

    it('returns the table headers for the matched status', () => {
      expect(dashboardTableHeader('matched', sortBy, sortDirection, hrefPrefix)).toEqual([
        sortHeader<PlacementRequestSortField>('Name and CRN', 'person_name', sortBy, sortDirection, hrefPrefix),
        sortHeader<PlacementRequestSortField>('Tier', 'person_risks_tier', sortBy, sortDirection, hrefPrefix),
        sortHeader<PlacementRequestSortField>('Request type', 'request_type', sortBy, sortDirection, hrefPrefix),
        { text: 'Booked arrival date' },
        { text: 'Approved Premises' },
      ])
    })

    it('returns the table headers when no status is provided', () => {
      expect(dashboardTableHeader(undefined, sortBy, sortDirection, hrefPrefix)).toEqual([
        sortHeader<PlacementRequestSortField>('Name and CRN', 'person_name', sortBy, sortDirection, hrefPrefix),
        sortHeader<PlacementRequestSortField>('Tier', 'person_risks_tier', sortBy, sortDirection, hrefPrefix),
        sortHeader<PlacementRequestSortField>('Request type', 'request_type', sortBy, sortDirection, hrefPrefix),
        sortHeader<PlacementRequestSortField>(
          'Application date',
          'application_date',
          sortBy,
          sortDirection,
          hrefPrefix,
        ),
        sortHeader<PlacementRequestSortField>(
          'Requested arrival date',
          'expected_arrival',
          sortBy,
          sortDirection,
          hrefPrefix,
        ),
        sortHeader<PlacementRequestSortField>('Length of stay', 'duration', sortBy, sortDirection, hrefPrefix),
        { text: 'Status' },
      ])
    })
  })
})
