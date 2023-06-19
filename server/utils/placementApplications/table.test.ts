import { placementApplicationTaskFactory } from '../../testutils/factories'
import { nameCell, placementTypeCell, statusCell, tableRows } from './table'
import { crnCell, tierCell } from '../tableUtils'

describe('table', () => {
  describe('nameCell', () => {
    it('returns the name of the service user and a link', () => {
      const task = placementApplicationTaskFactory.build()

      expect(nameCell(task)).toEqual({
        html: `<a href="/placement-applications/${task.id}/review" data-cy-placementApplicationId="${task.id}" data-cy-applicationId="${task.applicationId}">${task.person.name}</a>`,
      })
    })
  })

  describe('placementTypeCell', () => {
    it('returns the correct placement type', () => {
      const task = placementApplicationTaskFactory.build({ placementType: 'rotl' })

      expect(placementTypeCell(task)).toEqual({ text: 'ROTL' })
    })
  })

  describe('statusCell', () => {
    it('returns the correct placement type', () => {
      const task = placementApplicationTaskFactory.build({ status: 'complete' })

      expect(statusCell(task)).toEqual({ html: '<strong class="govuk-tag">Complete</strong>' })
    })
  })

  describe('tableRows', () => {
    const tasks = placementApplicationTaskFactory.buildList(1)

    expect(tableRows(tasks)).toEqual([
      [nameCell(tasks[0]), crnCell(tasks[0]), tierCell(tasks[0]), placementTypeCell(tasks[0]), statusCell(tasks[0])],
    ])
  })
})
