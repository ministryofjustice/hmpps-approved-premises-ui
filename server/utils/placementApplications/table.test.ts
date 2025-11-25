import { placementApplicationTaskFactory } from '../../testutils/factories'
import {
  arrivalDateCell,
  nameCell,
  placementApplicationsTable,
  placementTypeCell,
  statusCell,
  tableRows,
} from './table'
import { crnCell, tierCell } from '../tableUtils'
import * as utils from '../utils'
import paths from '../../paths/placementApplications'
import { sortHeader } from '../sortHeader'
import { TaskSortField } from '../../@types/shared'
import { DateFormats } from '../dateUtils'

describe('table', () => {
  const stubLink = 'LINK'
  const stubSentenceCase = 'SENTENCE_CASE'

  beforeEach(() => {
    jest.spyOn(utils, 'linkTo').mockReturnValue(stubLink)
    jest.spyOn(utils, 'sentenceCase').mockReturnValue(stubSentenceCase)
  })

  describe('placementApplicationsTable', () => {
    it('returns the correct table', () => {
      const hrefPrefix = 'http://localhost/example?something=else'
      const tasks = placementApplicationTaskFactory.buildList(1)
      const sortBy = 'person'
      const sortDirection = 'asc'

      expect(placementApplicationsTable(tasks, sortBy, sortDirection, hrefPrefix)).toEqual({
        firstCellIsHeader: true,
        head: [
          sortHeader<TaskSortField>('Name', 'person', sortBy, sortDirection, hrefPrefix),
          {
            text: 'CRN',
          },
          {
            text: 'Tier',
          },
          sortHeader<TaskSortField>(`Arrival date`, 'expectedArrivalDate', sortBy, sortDirection, hrefPrefix),
          {
            text: 'Type of request',
          },
          {
            text: 'Status',
          },
        ],
        rows: tableRows(tasks),
      })
    })
  })

  describe('nameCell', () => {
    it('returns the name of the service user and a link', () => {
      const task = placementApplicationTaskFactory.build()

      nameCell(task)

      expect(utils.linkTo).toHaveBeenCalledWith(paths.placementApplications.review.show({ id: task.id }), {
        text: task.personName,
        attributes: { 'data-cy-placementApplicationId': task.id, 'data-cy-applicationId': task.applicationId },
      })
    })
  })

  describe('placementTypeCell', () => {
    it('returns the correct placement type', () => {
      const task = placementApplicationTaskFactory.build({ placementType: 'rotl' })

      expect(placementTypeCell(task)).toEqual({ text: 'ROTL' })
    })
  })

  describe('arrivalDateCell', () => {
    it('returns the application arrival date', () => {
      const task = placementApplicationTaskFactory.build()

      expect(arrivalDateCell(task)).toEqual({
        text: DateFormats.isoDateToUIDate(task.expectedArrivalDate, { format: 'short' }),
      })
    })
  })

  describe('tableRows', () => {
    it('returns the correct table rows', () => {
      const tasks = placementApplicationTaskFactory.buildList(1)

      expect(tableRows(tasks)).toEqual([
        [
          {
            html: stubLink,
          },
          crnCell(tasks[0]),
          tierCell(tasks[0].tier?.value?.level),
          arrivalDateCell(tasks[0]),
          placementTypeCell(tasks[0]),
          statusCell(tasks[0]),
        ],
      ])
      expect(utils.linkTo).toHaveBeenCalledWith(paths.placementApplications.review.show({ id: tasks[0].id }), {
        text: tasks[0].personName,
        attributes: {
          'data-cy-placementApplicationId': tasks[0].id,
          'data-cy-applicationId': tasks[0].applicationId,
        },
      })
    })
  })
})
