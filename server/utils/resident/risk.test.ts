import { cas1OasysGroupFactory } from '../../testutils/factories'
import { summaryCards } from './risk'
import * as residentUtils from './index'

describe('summaryCards', () => {
  it('should render a list of cards from a given OASys group', () => {
    jest.spyOn(residentUtils, 'detailsBody').mockReturnValue('details-section')
    const group = cas1OasysGroupFactory.offenceDetails().build()
    const questionNumbers = group.answers.map(({ questionNumber }) => questionNumber)

    const result = summaryCards(questionNumbers, group, 'group name')
    group.answers.forEach((answer, index) => {
      expect(result[index].card).toEqual({ title: { text: answer.label } })

      expect(result[index].html).toMatchStringIgnoringWhitespace(`
      <table class="govuk-table">
        <tbody class="govuk-table__body">
          <tr class="govuk-table__row">
            <td class="govuk-table__cell">
              ${answer.questionNumber} group name
            </td>
          </tr>
        </tbody>
      </table>details-section`)
    })
  })
})
