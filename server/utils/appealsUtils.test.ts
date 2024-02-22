import { appealFactory } from '../testutils/factories'
import { appealSummaryListItems } from './appealsUtils'
import { DateFormats } from './dateUtils'

describe('AppealsUtils', () => {
  it('returns the correct objects in an array when all the expected data is present', () => {
    const appeal = appealFactory.build()

    expect(appealSummaryListItems(appeal)).toEqual([
      {
        key: {
          text: 'Appeal arbitrator',
        },
        value: {
          text: appeal.createdByUser.name,
        },
      },
      {
        key: {
          text: 'Has this person been assessed as suitable following an appeal?',
        },
        value: {
          text: appeal.decision === 'accepted' ? 'Yes' : 'No',
        },
      },
      {
        key: {
          text: 'What was the date of the appeal?',
        },
        value: {
          text: DateFormats.isoDateToUIDate(appeal.appealDate),
        },
      },
      {
        key: {
          text: 'What was the reason for appeal?',
        },
        value: {
          text: appeal.appealDetail,
        },
      },
      {
        key: {
          text: 'Provide details of appeal decision?',
        },
        value: {
          text: appeal.decisionDetail,
        },
      },
    ])
  })
})
