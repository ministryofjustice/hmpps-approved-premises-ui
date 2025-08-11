import { PlacementRequestSortField } from '@approved-premises/api'
import { cas1PlacementRequestSummaryFactory, personFactory, restrictedPersonFactory } from '../../testutils/factories'
import { dashboardTableHeader, dashboardTableRows, durationCell, nameCell } from './table'
import { DateFormats } from '../dateUtils'
import { htmlCell, textCell } from '../tableUtils'
import { sortHeader } from '../sortHeader'
import { displayName, tierBadge } from '../personUtils'
import * as utils from '../utils'
import adminPaths from '../../paths/admin'
import { placementRequestStatus } from '../formUtils'
import { fullPersonFactory } from '../../testutils/factories/person'

describe('tableUtils', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('nameCell', () => {
    beforeEach(() => {
      jest.spyOn(utils, 'linkTo')
    })

    it('returns the name of the service user and a link with a placement request', () => {
      const placementRequest = cas1PlacementRequestSummaryFactory.build({
        person: fullPersonFactory.build(),
      })

      nameCell(placementRequest)

      expect(utils.linkTo).toHaveBeenCalledWith(
        adminPaths.admin.placementRequests.show({ placementRequestId: placementRequest.id }),
        {
          text: displayName(placementRequest.person),
          attributes: {
            'data-cy-placementRequestId': placementRequest.id,
            'data-cy-applicationId': placementRequest.applicationId,
          },
        },
      )
    })

    it('returns the crn cell with no link if the person is a restrictedPerson', () => {
      const restrictedPersonPlacementRequest = cas1PlacementRequestSummaryFactory.build({
        person: restrictedPersonFactory.build(),
      })

      expect(nameCell(restrictedPersonPlacementRequest)).toEqual({
        text: `LAO: ${restrictedPersonPlacementRequest.person.crn}`,
      })
    })

    it('returns the persons name prefixed with "LAO: " if the person is a FullPerson and has the isRestricted flag', () => {
      const restrictedPersonPlacementRequest = cas1PlacementRequestSummaryFactory.build({
        person: personFactory.build({ isRestricted: true }),
      })

      nameCell(restrictedPersonPlacementRequest)

      expect(utils.linkTo).toHaveBeenCalledWith(
        adminPaths.admin.placementRequests.show({ placementRequestId: restrictedPersonPlacementRequest.id }),
        {
          text: displayName(restrictedPersonPlacementRequest.person),
          attributes: {
            'data-cy-placementRequestId': restrictedPersonPlacementRequest.id,
            'data-cy-applicationId': restrictedPersonPlacementRequest.applicationId,
          },
        },
      )
    })

    it('returns the crn cell if the person is a unknown person', () => {
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
    it('returns table rows for non matched placement requests', () => {
      const placementRequest = cas1PlacementRequestSummaryFactory.build({ isParole: true })

      expect(dashboardTableRows([placementRequest], 'notMatched')).toEqual([
        [
          nameCell(placementRequest),
          htmlCell(tierBadge(placementRequest.personTier)),
          textCell(DateFormats.isoDateToUIDate(placementRequest.requestedPlacementArrivalDate, { format: 'short' })),
          textCell('N/A'),
          textCell(DateFormats.isoDateToUIDate(placementRequest.applicationSubmittedDate, { format: 'short' })),
          durationCell(placementRequest.requestedPlacementDuration),
          textCell('Parole'),
          textCell(placementRequestStatus[placementRequest.placementRequestStatus]),
        ],
      ])
    })

    it('returns the request type as Standard release if the placement request is not of type parole', () => {
      const placementRequest = cas1PlacementRequestSummaryFactory.build({ isParole: false })

      expect(dashboardTableRows([placementRequest], 'notMatched')[0][6]).toEqual(textCell('Standard release'))
    })

    it('returns the booking premises name instead of the requested duration for matched placement requests', () => {
      const placementRequest = cas1PlacementRequestSummaryFactory.matched().build()

      expect(dashboardTableRows([placementRequest], 'matched')[0][5]).toEqual(
        textCell(placementRequest.firstBookingPremisesName),
      )
    })

    it('returns table rows with duration when the requested status is undefined', () => {
      const placementRequest = cas1PlacementRequestSummaryFactory.build()

      expect(dashboardTableRows([placementRequest], undefined)[0][5]).toEqual(
        durationCell(placementRequest.requestedPlacementDuration),
      )
    })
  })

  describe('dashboardTableHeader', () => {
    const sortBy = 'duration'
    const sortDirection = 'asc'
    const hrefPrefix = 'http://example.com'

    it('returns the default header for a non-matched view', () => {
      expect(dashboardTableHeader('notMatched', sortBy, sortDirection, hrefPrefix)).toEqual([
        sortHeader<PlacementRequestSortField>('Name', 'person_name', sortBy, sortDirection, hrefPrefix),
        sortHeader<PlacementRequestSortField>('Tier', 'person_risks_tier', sortBy, sortDirection, hrefPrefix),
        sortHeader<PlacementRequestSortField>(
          'Requested arrival date',
          'expected_arrival',
          sortBy,
          sortDirection,
          hrefPrefix,
        ),
        {
          text: 'Booked arrival date',
        },
        sortHeader<PlacementRequestSortField>(
          'Application date',
          'application_date',
          sortBy,
          sortDirection,
          hrefPrefix,
        ),
        sortHeader<PlacementRequestSortField>('Length of stay', 'duration', sortBy, sortDirection, hrefPrefix),
        sortHeader<PlacementRequestSortField>('Request type', 'request_type', sortBy, sortDirection, hrefPrefix),
        {
          text: 'Status',
        },
      ])
    })

    it('returns the default header for a matched view', () => {
      expect(dashboardTableHeader('matched', sortBy, sortDirection, hrefPrefix)).toEqual([
        sortHeader<PlacementRequestSortField>('Name', 'person_name', sortBy, sortDirection, hrefPrefix),
        sortHeader<PlacementRequestSortField>('Tier', 'person_risks_tier', sortBy, sortDirection, hrefPrefix),
        sortHeader<PlacementRequestSortField>(
          'Requested arrival date',
          'expected_arrival',
          sortBy,
          sortDirection,
          hrefPrefix,
        ),
        {
          text: 'Booked arrival date',
        },
        sortHeader<PlacementRequestSortField>(
          'Application date',
          'application_date',
          sortBy,
          sortDirection,
          hrefPrefix,
        ),
        {
          text: 'Approved Premises',
        },
        sortHeader<PlacementRequestSortField>('Request type', 'request_type', sortBy, sortDirection, hrefPrefix),
        {
          text: 'Status',
        },
      ])
    })
  })
})
