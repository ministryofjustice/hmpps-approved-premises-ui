import { add } from 'date-fns'
import { placementRequestTaskFactory } from '../../testutils/factories'
import { dueDateCell, expectedArrivalDateCell, nameCell, releaseTypeCell, tableRows } from './table'
import { DateFormats } from '../dateUtils'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { crnCell, tierCell } from '../tableUtils'

describe('tableUtils', () => {
  describe('nameCell', () => {
    it('returns the name of the service user and a link', () => {
      const task = placementRequestTaskFactory.build()

      expect(nameCell(task)).toEqual({
        html: `<a href="/placement-requests/${task.id}" data-cy-placementRequestId="${task.id}">${task.personName}</a>`,
      })
    })
  })

  describe('expectedArrivalDateCell', () => {
    it('returns a formatted arrival date', () => {
      const task = placementRequestTaskFactory.build({ expectedArrival: '2022-01-01' })

      expect(expectedArrivalDateCell(task)).toEqual({
        text: DateFormats.isoDateToUIDate('2022-01-01'),
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
})
