import { add } from 'date-fns'
import { PlacementRequestSortField } from '@approved-premises/api'
import {
  cas1PlacementRequestSummaryFactory,
  personFactory,
  placementRequestFactory,
  restrictedPersonFactory,
} from '../../testutils/factories'
import {
  dashboardTableHeader,
  dashboardTableRows,
  dueDateCell,
  durationCell,
  expectedArrivalDateCell,
  nameCell,
  releaseTypeCell,
  tableRows,
} from './table'
import { DateFormats } from '../dateUtils'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { crnCell, htmlCell, textCell, tierCell } from '../tableUtils'
import { sortHeader } from '../sortHeader'
import { displayName, tierBadge } from '../personUtils'
import { linkTo } from '../utils'
import adminPaths from '../../paths/admin'
import { placementRequestStatus } from '../formUtils'

jest.mock('../utils.ts')

describe('tableUtils', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('nameCell', () => {
    it('returns the name of the service user and a link with a placement request', () => {
      const placementRequest = placementRequestFactory.withFullPerson().build()

      nameCell(placementRequest)

      expect(linkTo).toHaveBeenCalledWith(adminPaths.admin.placementRequests.show({ id: placementRequest.id }), {
        text: displayName(placementRequest.person),
        attributes: {
          'data-cy-placementRequestId': placementRequest.id,
          'data-cy-applicationId': placementRequest.applicationId,
        },
      })
    })

    it('returns the crn cell with no link if the person is a restrictedPerson', () => {
      const restrictedPersonTask = placementRequestFactory.build({
        person: restrictedPersonFactory.build(),
      })

      expect(nameCell(restrictedPersonTask)).toEqual({
        text: `LAO: ${restrictedPersonTask.person.crn}`,
      })
    })

    it('returns the persons name prefixed with "LAO: " if the person is a FullPerson and has the isRestricted flag', () => {
      const restrictedPersonTask = placementRequestFactory.build({
        person: personFactory.build({ isRestricted: true }),
      })

      nameCell(restrictedPersonTask)

      expect(linkTo).toHaveBeenCalledWith(adminPaths.admin.placementRequests.show({ id: restrictedPersonTask.id }), {
        text: displayName(restrictedPersonTask.person),
        attributes: {
          'data-cy-placementRequestId': restrictedPersonTask.id,
          'data-cy-applicationId': restrictedPersonTask.applicationId,
        },
      })
    })

    it('returns the crn cell if the person is a unknown person', () => {
      const unknownPersonTask = placementRequestFactory.build()
      unknownPersonTask.person = restrictedPersonFactory.build({ type: 'UnknownPerson' })

      expect(nameCell(unknownPersonTask)).toEqual({
        text: `Unknown: ${unknownPersonTask.person.crn}`,
      })
    })
  })

  describe('expectedArrivalDateCell', () => {
    it('returns a formatted arrival date with a placement request', () => {
      const task = placementRequestFactory.build({ expectedArrival: '2022-01-01' })

      expect(expectedArrivalDateCell(task)).toEqual({
        text: DateFormats.isoDateToUIDate('2022-01-01'),
      })
    })

    it('returns a formatted arrival date in short format', () => {
      const task = placementRequestFactory.build({ expectedArrival: '2022-01-01' })

      expect(expectedArrivalDateCell(task, 'short')).toEqual({
        text: DateFormats.isoDateToUIDate('2022-01-01', { format: 'short' }),
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

  describe('dueDateCell', () => {
    it('returns the difference in days between the arrival date and the due date', () => {
      DateFormats.differenceInBusinessDays = jest.fn().mockReturnValue(7)

      const arrivalDate = add(new Date(), { days: 14 })
      const task = placementRequestFactory.build({
        expectedArrival: DateFormats.dateObjToIsoDate(arrivalDate),
      })

      expect(dueDateCell(task, 7)).toEqual({
        text: '7 days',
      })
    })
  })

  describe('releaseTypeCell', () => {
    it('returns the release type', () => {
      const task = placementRequestFactory.build({ releaseType: 'rotl' })

      expect(releaseTypeCell(task)).toEqual({ text: allReleaseTypes.rotl })
    })
  })

  describe('tableRows', () => {
    it('returns table rows for placement requests', () => {
      const placementRequest = placementRequestFactory.build()

      expect(tableRows([placementRequest])).toEqual([
        [
          nameCell(placementRequest),
          crnCell(placementRequest.person),
          tierCell(placementRequest.risks),
          expectedArrivalDateCell(placementRequest),
          dueDateCell(placementRequest, 7),
          releaseTypeCell(placementRequest),
        ],
      ])
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
