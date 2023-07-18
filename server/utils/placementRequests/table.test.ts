import { add } from 'date-fns'
import { placementRequestFactory, placementRequestTaskFactory } from '../../testutils/factories'
import {
  dashboardTableRows,
  dueDateCell,
  durationCell,
  expectedArrivalDateCell,
  nameCell,
  releaseTypeCell,
  statusCell,
  tableRows,
} from './table'
import { DateFormats } from '../dateUtils'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { crnCell, tierCell } from '../tableUtils'
import { PlacementRequestStatus } from '../../@types/shared'

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
        html: `<a href="/placement-requests/${placementRequest.id}" data-cy-placementRequestId="${placementRequest.id}">${placementRequest.person.name}</a>`,
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

  describe('statusCell', () => {
    const statuses = {
      notMatched: 'Not started',
      unableToMatch: 'Unable to allocate',
      matched: 'Booking allocated',
    } as Record<PlacementRequestStatus, string>

    it.each(Object.keys(statuses))('returns the correct status for %s', (key: PlacementRequestStatus) => {
      const placementRequest = placementRequestFactory.build({ status: key })

      expect(statusCell(placementRequest)).toEqual({
        text: statuses[key],
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

  describe('dashboardTableRows', () => {
    it('returns table rows for placement requests', () => {
      const placementRequest = placementRequestFactory.build()

      expect(dashboardTableRows([placementRequest])).toEqual([
        [
          nameCell(placementRequest),
          crnCell(placementRequest.person),
          expectedArrivalDateCell(placementRequest),
          durationCell(placementRequest),
          statusCell(placementRequest),
        ],
      ])
    })
  })
})
