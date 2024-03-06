import { when } from 'jest-when'
import {
  assessmentSummaryFactory,
  placementRequestTaskFactory,
  taskFactory,
  tierEnvelopeFactory,
} from '../testutils/factories'
import { tierBadge } from './personUtils'
import { crnCell, daysUntilDueCell, emailCell, nameCell, tierCell } from './tableUtils'
import { DateFormats } from './dateUtils'

jest.mock('./dateUtils')

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

  describe('emailCell', () => {
    it('returns the email cell for the item', () => {
      expect(emailCell({ email: 'test' })).toEqual({ text: 'test' })
    })
  })

  describe.each([['task'], ['assessmentSummary']])('daysUntilDueCell works with with `%s` item types', itemType => {
    const date = new Date()

    const item = {
      task: taskFactory.build(),
      assessmentSummary: assessmentSummaryFactory.build(),
    }[itemType]

    beforeAll(() => {
      jest.useFakeTimers()
      jest.setSystemTime(date)
    })

    afterAll(() => {
      jest.useRealTimers()
    })

    it('returns the days until due', () => {
      when(DateFormats.differenceInBusinessDays)
        .calledWith(DateFormats.isoToDateObj(item.dueAt), date)
        .mockReturnValue(10)

      expect(daysUntilDueCell(item, 'some-class')).toEqual({
        html: '10 Days',
        attributes: {
          'data-sort-value': 10,
        },
      })
    })

    it('returns the days until due with a warning when the due date is approaching', () => {
      when(DateFormats.differenceInBusinessDays)
        .calledWith(DateFormats.isoToDateObj(item.dueAt), date)
        .mockReturnValue(2)

      expect(daysUntilDueCell(item, 'some-class')).toEqual({
        html: `<strong class="some-class">2 Days<span class="govuk-visually-hidden"> (Approaching due date)</span></strong>`,
        attributes: {
          'data-sort-value': 2,
        },
      })
    })

    it('returns the days until due with a warning when the due date is after today', () => {
      when(DateFormats.differenceInBusinessDays)
        .calledWith(DateFormats.isoToDateObj(item.dueAt), date)
        .mockReturnValue(-5)

      expect(daysUntilDueCell(item, 'some-class')).toEqual({
        html: `<strong class="some-class">-5 Days<span class="govuk-visually-hidden"> (Overdue by 5 days)</span></strong>`,
        attributes: {
          'data-sort-value': -5,
        },
      })
    })

    it('returns "today" when the task is due today', () => {
      when(DateFormats.differenceInBusinessDays)
        .calledWith(DateFormats.isoToDateObj(item.dueAt), date)
        .mockReturnValue(0)

      expect(daysUntilDueCell(item, 'some-class')).toEqual({
        html: '<strong class="some-class">Today</strong>',
        attributes: {
          'data-sort-value': 0,
        },
      })
    })
  })
})
