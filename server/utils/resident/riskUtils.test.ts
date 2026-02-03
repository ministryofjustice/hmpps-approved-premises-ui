import { render } from 'nunjucks'
import { TableRow } from '@approved-premises/ui'
import { cas1OasysGroupFactory, risksFactory } from '../../testutils/factories'
import { ndeliusRiskCard, oasysGroupMapping, oasysMetadataRow, roshWidget, summaryCards } from './riskUtils'
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

      const result = summaryCards(questionNumbers, group)
      group.answers.forEach((answer, index) => {
        expect(result[index].card).toEqual({ title: { text: answer.label } })

        expect(result[index].html).toMatchStringIgnoringWhitespace(
          `${oasysMetadataRow(answer.questionNumber, oasysGroupMapping[group.group], group)}Nunjucks template partials/detailsBlock.njk`,
        )
      })
    })
  })

  describe('NDelius risk card', () => {
    const crn = 'crn'
    const mockLink = 'ndelius link'
    beforeEach(() => {
      jest.spyOn(utils, 'ndeliusDeeplink').mockReturnValue(mockLink)
    })

    const expected = (rows: Array<TableRow>) => ({
      card: { title: { text: 'NDelius risk flags' } },
      html: mockLink,
      table: { head: [{ text: 'Risk flag' }], rows },
    })

    it('Should render the risk card with ndelius link', () => {
      const personRisks = risksFactory.build({ flags: { value: ['Risk flag text'] } })

      expect(ndeliusRiskCard(crn, personRisks)).toEqual(expected([[{ text: 'Risk flag text' }]]))
    })

    it('Should handle no risks', () => {
      const personRisks = risksFactory.build({ flags: { value: undefined } })

      expect(ndeliusRiskCard(crn, personRisks)).toEqual(expected([]))
    })
  })
})
