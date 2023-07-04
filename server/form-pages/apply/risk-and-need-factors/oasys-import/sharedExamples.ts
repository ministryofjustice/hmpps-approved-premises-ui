import { Constructor } from '../../../../utils/oasysImportUtils'
import type TasklistPage from '../../../tasklistPage'

export const itShouldHandleErrors = <T extends TasklistPage>(
  constructor: Constructor<T>,
  { answerKey, summaryKey }: { answerKey: string; summaryKey: string },
) => {
  describe('errors', () => {
    const summaries = [
      {
        questionNumber: '1',
        label: 'The first question',
        answer: 'Some answer for the first question',
      },
      {
        questionNumber: '2',
        label: 'The second question',
        answer: 'Some answer for the second question',
      },
    ]

    it(`should handle missing responses`, () => {
      const answers = { '1': '', '2': 'Some response' }

      const body = {
        [`${answerKey}`]: answers,
        [`${summaryKey}`]: summaries,
      }

      const page = new constructor(body)

      expect(page.errors()).toEqual({
        [`${answerKey}[1]`]: "You must enter a response for the 'The first question' question",
      })
    })

    it('should return success when answers are populated', () => {
      const answers = { '1': 'Some response', '2': 'Some response' }

      const body = {
        [`${answerKey}`]: answers,
        [`${summaryKey}`]: summaries,
      }
      const page = new constructor(body)
      expect(page.errors()).toEqual({})
    })
  })
}
