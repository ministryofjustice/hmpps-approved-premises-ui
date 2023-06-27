import { placementRequestTaskFactory, taskFactory, tierEnvelopeFactory } from '../testutils/factories'
import { tierBadge } from './personUtils'
import { crnCell, nameCell, tierCell } from './tableUtils'

describe('tableUtils', () => {
  describe('nameCell', () => {
    it('returns the name of the person the task is assigned to as a TableCell object', () => {
      const task = taskFactory.build()
      expect(nameCell(task)).toEqual({ text: task.personName })
    })
  })

  describe('crnCell', () => {
    it('returns the crn of the person the task is assigned to as a TableCell object', () => {
      const task = taskFactory.build()
      expect(crnCell(task)).toEqual({ text: task.crn })
    })
  })

  describe('tierCell', () => {
    it('returns the tier badge for the service user associated with the task', () => {
      const tier = tierEnvelopeFactory.build({ value: { level: 'A1' } })
      const task = placementRequestTaskFactory.build({ tier })

      expect(tierCell(task)).toEqual({ html: tierBadge('A1') })
    })
  })
})
