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
          text: user.apArea?.name,
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
        attributes: {
          'aria-sort': 'ascending',
        },
      },
      {
        text: 'AP Area',
      },
      {
        text: 'Qualification',
      },
      {
        text: 'Tasks pending',
        attributes: {
          'aria-sort': 'none',
        },
      },
      {
        text: 'Tasks completed in previous 7 days',
        attributes: {
          'aria-sort': 'none',
        },
      },
      {
        text: 'Tasks completed in previous 30 days',
        attributes: {
          'aria-sort': 'none',
        },
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
      qualifications: ['pipe', 'emergency', 'esap', 'lao', 'womens', 'recovery_focused', 'mental_health_specialist'],
    })

    expect(qualificationCell(user)).toEqual({
      text: "PIPE, Emergency APs, ESAP, Limited access offenders, Women's APs, Recovery-focused APs, Specialist Mental Health APs",
    })
  })
})
