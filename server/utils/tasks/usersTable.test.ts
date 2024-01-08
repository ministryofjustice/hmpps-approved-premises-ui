import { taskFactory, userWithWorkloadFactory } from '../../testutils/factories'
import { allocationCell, buttonCell, qualificationCell, userTableHeader, userTableRows } from './usersTable'

describe('userTableRows', () => {
  it('should return the table in the correct format', () => {
    const users = userWithWorkloadFactory.buildList(1)
    const user = users[0]
    const task = taskFactory.build()

    expect(userTableRows(users, task, 'csrfToken')).toEqual([
      [
        { text: user.name },
        {
          text: user.region.name,
        },
        qualificationCell(user),
        allocationCell(user, 'numTasksPending'),
        allocationCell(user, 'numTasksCompleted7Days'),
        allocationCell(user, 'numTasksCompleted30Days'),
        buttonCell(user, task, 'csrfToken'),
      ],
    ])
  })
})

describe('userTableHeader', () => {
  it('returns the correct headers', () => {
    expect(userTableHeader()).toEqual([
      {
        text: 'Name',
      },
      {
        text: 'Region',
      },
      {
        text: 'Qualification',
      },
      {
        text: 'Tasks pending',
      },
      {
        text: 'Tasks completed in previous 7 days',
      },
      {
        text: 'Tasks completed in previous 30 days',
      },
      {
        text: 'Action',
      },
    ])
  })
})

describe('qualificationCell', () => {
  it('returns the qualifications in UI friendly format', () => {
    const user = userWithWorkloadFactory.build({
      qualifications: ['pipe', 'emergency', 'esap', 'lao', 'womens'],
    })

    expect(qualificationCell(user)).toEqual({
      text: "PIPE, Emergency APs, ESAP, Limited access offenders, Women's APs",
    })
  })
})
