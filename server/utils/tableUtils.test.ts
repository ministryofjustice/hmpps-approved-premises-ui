import { when } from 'jest-when'
import {
  assessmentSummaryFactory,
  placementApplicationTaskFactory,
  taskFactory,
  tierEnvelopeFactory,
} from '../testutils/factories'
import { tierBadge } from './personUtils'
import { crnCell, dateCell, daysUntilDueCell, emailCell, tierCell } from './tableUtils'
import { DateFormats } from './dateUtils'

describe('tableUtils', () => {
  describe('dateCell', () => {
    it('returns a cell with a date in the short format from an ISO date', () => {
      expect(dateCell('2022-01-01')).toEqual({ text: '1 Jan 2022' })
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
      const task = placementApplicationTaskFactory.build({ tier })

      expect(tierCell(task)).toEqual({ html: tierBadge('A1') })
    })
  })

  describe('emailCell', () => {
    it('returns the email cell for the item', () => {
      expect(emailCell({ email: 'test' })).toEqual({ text: 'test' })
    })
  })

  describe.each([
    ['task', taskFactory],
    ['assessment summary', assessmentSummaryFactory],
  ])('daysUntilDueCell works with with `%s` item types', (_, factory) => {
    const date = new Date()
    const item = factory.build()

    beforeAll(() => {
      jest.useFakeTimers()
      jest.setSystemTime(date)
      jest.spyOn(DateFormats, 'differenceInBusinessDays')
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
