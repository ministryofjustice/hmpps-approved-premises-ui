import { cancellationFactory } from '../../testutils/factories'
import { cancellationRow, cancellationSummary } from './cancellationSummaryList'

describe('cancellationSummaryList', () => {
  describe('cancellationSummary', () => {
    it('returns a summary of the cancellation', () => {
      const cancellation = cancellationFactory.build()

      expect(cancellationSummary(cancellation)).toEqual({
        card: {
          title: {
            text: 'Previous match',
          },
        },
        rows: [
          cancellationRow('Approved Premises', cancellation.premisesName),
          cancellationRow('Date', cancellation.date),
          cancellationRow('Reason', cancellation.reason.name),
          cancellationRow('Notes', cancellation.notes),
        ],
      })
    })
  })
})
