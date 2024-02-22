import { Appeal } from '@approved-premises/api'
import { DateFormats } from './dateUtils'

export const appealSummaryListItems = (appeal: Appeal) => [
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
]
