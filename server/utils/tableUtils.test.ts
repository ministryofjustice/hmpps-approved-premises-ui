import { placementRequestTaskFactory, taskFactory, tierEnvelopeFactory } from '../testutils/factories'
import { tierBadge } from './personUtils'
import { crnCell, nameCell, tierCell } from './tableUtils'

describe('tableUtils', () => {
  describe('nameCell', () => {
    it('returns the name of the person the task is assigned to as a TableCell object', () => {
      const task = taskFactory.build()
      expect(nameCell(task)).toEqual({ text: task.person.name })
    })

    it('returns an empty string as a TableCell object if the task doesnt have a person', () => {
      const taskWithNoPersonName = taskFactory.build({ person: { name: undefined } })
      const taskWithNoPerson = taskFactory.build({ person: undefined })

      expect(nameCell(taskWithNoPersonName)).toEqual({ text: '' })
      expect(nameCell(taskWithNoPerson)).toEqual({ text: '' })
    })
  })

  describe('crnCell', () => {
    it('returns the crn of the person the task is assigned to as a TableCell object', () => {
      const task = taskFactory.build()
      expect(crnCell(task)).toEqual({ text: task.person.crn })
    })

    it('returns an empty string as a TableCell object if the task doesnt have a person', () => {
      const taskWithNoPersonCrn = taskFactory.build({ person: { crn: undefined } })
      const taskWithNoPerson = taskFactory.build({ person: undefined })

      expect(crnCell(taskWithNoPersonCrn)).toEqual({ text: '' })
      expect(crnCell(taskWithNoPerson)).toEqual({ text: '' })
    })
  })

  describe('tierCell', () => {
    it('returns the tier badge for the service user associated with the task', () => {
      const tier = tierEnvelopeFactory.build({ value: { level: 'A1' } })
      const task = placementRequestTaskFactory.build({ risks: { tier } })

      expect(tierCell(task)).toEqual({ html: tierBadge('A1') })
    })
  })
})
