import taskFactory from '../testutils/factories/task'
import { nameCell } from './tableUtils'

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
