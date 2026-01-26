import { render } from 'nunjucks'
import { cas1OasysGroupFactory, risksFactory } from '../../testutils/factories'
import { ndeliusRiskCard, roshWidget, summaryCards } from './riskUtils'
import { roshRisksFactory } from '../../testutils/factories/risks'
import * as utils from './index'

jest.mock('nunjucks')

describe('risk utils', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    ;(render as jest.Mock).mockImplementation(template => `Nunjucks template ${template}`)
  })

  describe('template renderers', () => {
    it('should render the rosh widget', async () => {
      const roshRisks = roshRisksFactory.build().value
      expect(roshWidget(roshRisks)).toEqual({
        html: 'Nunjucks template components/riskWidgets/rosh-widget/template.njk',
      })
      expect(render).toHaveBeenCalledWith('components/riskWidgets/rosh-widget/template.njk', { params: roshRisks })
    })
  })

  describe('summaryCards', () => {
    it('should render a list of cards from a given OASys group', () => {
      const group = cas1OasysGroupFactory.offenceDetails().build()
      const questionNumbers = group.answers.map(({ questionNumber }) => questionNumber)

      const result = summaryCards(questionNumbers, group, 'group name')
      group.answers.forEach((answer, index) => {
        expect(result[index].card).toEqual({ title: { text: answer.label } })

        expect(result[index].html).toMatchStringIgnoringWhitespace(`
      <table class="govuk-table text-table">
        <tbody class="govuk-table__body">
          <tr class="govuk-table__row">
            <td class="govuk-table__cell">
              ${answer.questionNumber} group name
            </td>
          </tr>
        </tbody>
      </table>Nunjucks template partials/detailsBlock.njk`)
      })
    })
  })

  describe('NDelius risk card', () => {
    it('Should render the risk card with ndelius link', () => {
      const crn = 'crn'
      const personRisks = risksFactory.build({ flags: { value: ['Risk flag text'] } })
      const mockLink = 'ndelius link'

      jest.spyOn(utils, 'ndeliusDeeplink').mockReturnValue(mockLink)

      expect(ndeliusRiskCard(crn, personRisks)).toEqual({
        card: { title: { text: 'NDelius risk flags' } },
        html: mockLink,
        table: { head: [{ text: 'Risk flag' }], rows: [[{ text: 'Risk flag text' }]] },
      })
    })
  })
})
