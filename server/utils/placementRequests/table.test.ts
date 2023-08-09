import { add } from 'date-fns'
import { bookingSummaryFactory, placementRequestFactory, placementRequestTaskFactory } from '../../testutils/factories'
import {
  dashboardTableHeader,
  dashboardTableRows,
  dueDateCell,
  durationCell,
  expectedArrivalDateCell,
  nameCell,
  premisesNameCell,
  releaseTypeCell,
  requestTypeCell,
  tableRows,
} from './table'
import { DateFormats } from '../dateUtils'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { crnCell, tierCell } from '../tableUtils'
import { sortHeader } from '../sortHeader'

describe('tableUtils', () => {
  describe('nameCell', () => {
    it('returns the name of the service user and a link with a task', () => {
      const task = placementRequestTaskFactory.build()

      expect(nameCell(task)).toEqual({
        html: `<a href="/placement-requests/${task.id}" data-cy-placementRequestId="${task.id}">${task.personName}</a>`,
      })
    })

    it('returns the name of the service user and a link with a placement request', () => {
      const placementRequest = placementRequestFactory.build()

      expect(nameCell(placementRequest)).toEqual({
        html: `<a href="/admin/placement-requests/${placementRequest.id}" data-cy-placementRequestId="${placementRequest.id}">${placementRequest.person.name}</a>`,
      })
    })

    it('returns an empty cell if the personName is blank', () => {
      const task = placementRequestTaskFactory.build({ personName: null })

      expect(nameCell(task)).toEqual({
        html: '',
      })
    })

    it('returns an empty cell if the personName is not present', () => {
      const task = placementRequestFactory.build({ person: null })

      expect(nameCell(task)).toEqual({
        html: '',
      })
    })
  })

  describe('expectedArrivalDateCell', () => {
    it('returns a formatted arrival date with a task', () => {
      const task = placementRequestTaskFactory.build({ expectedArrival: '2022-01-01' })

      expect(expectedArrivalDateCell(task)).toEqual({
        text: DateFormats.isoDateToUIDate('2022-01-01'),
      })
    })

    it('returns a formatted arrival date with a placement request', () => {
      const task = placementRequestFactory.build({ expectedArrival: '2022-01-01' })

      expect(expectedArrivalDateCell(task)).toEqual({
        text: DateFormats.isoDateToUIDate('2022-01-01'),
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
      const arrivalDate = add(new Date(), { days: 14 })
      const task = placementRequestTaskFactory.build({
        expectedArrival: DateFormats.dateObjToIsoDate(arrivalDate),
      })

      expect(dueDateCell(task, 7)).toEqual({
        text: '7 days',
      })
    })
  })

  describe('releaseTypeCell', () => {
    it('returns the release type', () => {
      const task = placementRequestTaskFactory.build({ releaseType: 'rotl' })

      expect(releaseTypeCell(task)).toEqual({ text: allReleaseTypes.rotl })
    })
  })

  describe('tableRows', () => {
    it('returns table rows for placement requests', () => {
      const task = placementRequestTaskFactory.build()

      expect(tableRows([task])).toEqual([
        [
          nameCell(task),
          crnCell(task),
          tierCell(task),
          expectedArrivalDateCell(task),
          dueDateCell(task, 7),
          releaseTypeCell(task),
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
          crnCell(placementRequest.person),
          tierCell(placementRequest.risks),
          expectedArrivalDateCell(placementRequest),
          durationCell(placementRequest),
          requestTypeCell(placementRequest),
        ],
      ])
    })

    it('returns table rows for matched placement requests', () => {
      const placementRequest = placementRequestFactory.build()

      expect(dashboardTableRows([placementRequest], 'matched')).toEqual([
        [
          nameCell(placementRequest),
          crnCell(placementRequest.person),
          tierCell(placementRequest.risks),
          expectedArrivalDateCell(placementRequest),
          premisesNameCell(placementRequest),
          requestTypeCell(placementRequest),
        ],
      ])
    })

    it('returns table rows when the status is undefined', () => {
      const placementRequest = placementRequestFactory.build()

      expect(dashboardTableRows([placementRequest], undefined)).toEqual([
        [
          nameCell(placementRequest),
          crnCell(placementRequest.person),
          tierCell(placementRequest.risks),
          expectedArrivalDateCell(placementRequest),
          durationCell(placementRequest),
          requestTypeCell(placementRequest),
        ],
      ])
    })
  })

  describe('dashboardTableHeader', () => {
    const sortBy = 'sortBy'
    const sortDirection = 'asc'
    const hrefPrefix = 'http://example.com'

    it('returns the default header for a non-matched view', () => {
      expect(dashboardTableHeader('notMatched', sortBy, sortDirection, hrefPrefix)).toEqual([
        {
          text: 'Name',
        },
        {
          text: 'CRN',
        },
        {
          text: 'Tier',
        },
        sortHeader('Arrival date', 'expectedArrival', sortBy, sortDirection, hrefPrefix),
        sortHeader('Length of stay', 'duration', sortBy, sortDirection, hrefPrefix),
        {
          text: 'Request type',
        },
      ])
    })

    it('returns the default header for a matched view', () => {
      expect(dashboardTableHeader('matched', sortBy, sortDirection, hrefPrefix)).toEqual([
        {
          text: 'Name',
        },
        {
          text: 'CRN',
        },
        {
          text: 'Tier',
        },
        sortHeader('Arrival date', 'expectedArrival', sortBy, sortDirection, hrefPrefix),
        {
          text: 'Approved Premises',
        },
        {
          text: 'Request type',
        },
      ])
    })
  })
})
