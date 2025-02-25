import { add } from 'date-fns'
import {
  bookingFactory,
  bookingSummaryFactory,
  personFactory,
  placementRequestFactory,
  placementRequestWithFullPersonFactory,
  restrictedPersonFactory,
} from '../../testutils/factories'
import {
  actualArrivalDateCell,
  applicationDateCell,
  dashboardTableHeader,
  dashboardTableRows,
  dueDateCell,
  durationCell,
  expectedArrivalDateCell,
  nameCell,
  premisesNameCell,
  releaseTypeCell,
  requestTypeCell,
  statusCell,
  tableRows,
} from './table'
import { DateFormats } from '../dateUtils'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { crnCell, tierCell } from '../tableUtils'
import { sortHeader } from '../sortHeader'
import { displayName } from '../personUtils'
import { PlacementRequestSortField } from '../../@types/shared'
import { linkTo } from '../utils'
import adminPaths from '../../paths/admin'

jest.mock('../utils.ts')

describe('tableUtils', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('nameCell', () => {
    it('returns the name of the service user and a link with a placement request', () => {
      const placementRequest = placementRequestWithFullPersonFactory.build()

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
      const restrictedPersonTask = placementRequestFactory.build()
      restrictedPersonTask.person = restrictedPersonFactory.build()

      expect(nameCell(restrictedPersonTask)).toEqual({
        text: `LAO: ${restrictedPersonTask.person.crn}`,
      })
    })

    it('returns the persons name prefixed with "LAO: " if the person is a FullPerson and has the isRestricted flag', () => {
      const restrictedPersonTask = placementRequestFactory.build()
      restrictedPersonTask.person = personFactory.build({ isRestricted: true })

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

  describe('actualArrivalDateCell', () => {
    it('returns the arrival date from the booking if present', () => {
      const booking = bookingFactory.build({ arrivalDate: '2022-01-01' })
      const placementRequest = placementRequestFactory.build({ booking })

      expect(actualArrivalDateCell(placementRequest)).toEqual({
        text: DateFormats.isoDateToUIDate(booking.arrivalDate, { format: 'short' }),
      })
    })

    it('returns N/A if there is no booking', () => {
      const placementRequest = placementRequestFactory.build({ booking: null })
      expect(actualArrivalDateCell(placementRequest)).toEqual({
        text: 'N/A',
      })
    })
  })

  describe('applicationDateCell', () => {
    it("returns the application's created at date", () => {
      const task = placementRequestFactory.build({ applicationDate: '2022-01-01' })

      expect(applicationDateCell(task)).toEqual({
        text: DateFormats.isoDateToUIDate('2022-01-01', { format: 'short' }),
      })
    })
  })

  describe('durationCell', () => {
    it('returns a formatted duration', () => {
      const placementRequest = placementRequestFactory.build({ duration: 16 })

      expect(durationCell(placementRequest)).toEqual({
        text: '2 weeks, 2 days',
      })
    })
  })

  describe('requestTypeCell', () => {
    it('returns parole if isParole is true', () => {
      const placementRequest = placementRequestFactory.build({ isParole: true })

      expect(requestTypeCell(placementRequest)).toEqual({
        text: 'Parole',
      })
    })

    it('returns standard if isParole is false', () => {
      const placementRequest = placementRequestFactory.build({ isParole: false })

      expect(requestTypeCell(placementRequest)).toEqual({
        text: 'Standard release',
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

  describe('premisesNameCell', () => {
    it('returns the premises name', () => {
      const placementRequest = placementRequestFactory.build({
        booking: bookingSummaryFactory.build({ premisesName: 'Premises Name' }),
      })

      expect(premisesNameCell(placementRequest)).toEqual({
        text: 'Premises Name',
      })
    })
  })

  describe('dashboardTableRows', () => {
    it('returns table rows for non matched placement requests', () => {
      const placementRequest = placementRequestFactory.build()

      expect(dashboardTableRows([placementRequest], 'notMatched')).toEqual([
        [
          nameCell(placementRequest),
          tierCell(placementRequest.risks),
          expectedArrivalDateCell(placementRequest, 'short'),
          actualArrivalDateCell(placementRequest),
          applicationDateCell(placementRequest),
          durationCell(placementRequest),
          requestTypeCell(placementRequest),
          statusCell(placementRequest),
        ],
      ])
    })

    it('returns table rows for matched placement requests', () => {
      const placementRequest = placementRequestFactory.build()

      expect(dashboardTableRows([placementRequest], 'matched')).toEqual([
        [
          nameCell(placementRequest),
          tierCell(placementRequest.risks),
          expectedArrivalDateCell(placementRequest, 'short'),
          actualArrivalDateCell(placementRequest),
          applicationDateCell(placementRequest),
          premisesNameCell(placementRequest),
          requestTypeCell(placementRequest),
          statusCell(placementRequest),
        ],
      ])
    })

    it('returns table rows when the status is undefined', () => {
      const placementRequest = placementRequestFactory.build()

      expect(dashboardTableRows([placementRequest], undefined)).toEqual([
        [
          nameCell(placementRequest),
          tierCell(placementRequest.risks),
          expectedArrivalDateCell(placementRequest, 'short'),
          actualArrivalDateCell(placementRequest),
          applicationDateCell(placementRequest),
          durationCell(placementRequest),
          requestTypeCell(placementRequest),
          statusCell(placementRequest),
        ],
      ])
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
          text: 'Actual arrival date',
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
          text: 'Actual arrival date',
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
