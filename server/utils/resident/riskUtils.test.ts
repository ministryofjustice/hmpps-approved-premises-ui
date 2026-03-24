import { render } from 'nunjucks'
import { cas1OasysGroupFactory, registrationFactory } from '../../testutils/factories'
import {
  ndeliusRiskCard,
  oasysGroupMapping,
  oasysMetadataRow,
  registrationRows,
  roshWidget,
  summaryCards,
} from './riskUtils'
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

    it('Should render the risk card with ndelius link and table', () => {
      const registrations = registrationFactory.buildList(2)

      const [headingCard, , tableCard] = ndeliusRiskCard(crn, registrations)

      expect(headingCard.html).toContain('<h2 class="govuk-heading-m">NDelius risk flags (registers)</h2>')

      expect(tableCard.table).toEqual({
        head: [{ text: 'Flag' }, { text: 'Notes' }],
        rows: registrationRows(registrations),
      })
      expect(tableCard.html).toBeUndefined()
      const rows = registrationRows(registrations)
      expect(rows).toHaveLength(2)
      expect(rows[0][0]).toMatchObject({
        html: expect.stringContaining(`<strong>${registrations[0].description}</strong>`),
        classes: 'govuk-!-width-one-third',
      })
    })
  })
})
