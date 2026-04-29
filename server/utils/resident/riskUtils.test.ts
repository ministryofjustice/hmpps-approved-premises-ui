import { render } from 'nunjucks'
import { cas1OasysGroupFactory, registrationFactory } from '../../testutils/factories'
import {
  ndeliusRiskCards,
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

      const [headingCard, , tableCard] = ndeliusRiskCards(crn, registrations, 'success')

      expect(headingCard.html).toContain('<h2 class="govuk-heading-m">NDelius risk flags (registers)</h2>')

      expect(tableCard.table).toEqual({
        head: [{ text: 'Flag' }, { text: 'Notes' }],
        rows: registrationRows(registrations),
      })
      expect(tableCard.html).toBeUndefined()
    })

    it('should return registration rows with description and risk flag group', () => {
      const registrations = registrationFactory.buildList(2)

      const rows = registrationRows(registrations)
      expect(rows).toHaveLength(2)
      expect(rows[0][0]).toMatchObject({
        html: expect.stringContaining(`<strong>${registrations[0].description}</strong>`),
        classes: 'govuk-!-width-one-third',
      })
      expect((rows[0][0] as { html: string }).html).toContain(registrations[0].riskFlagGroupDescription)
    })

    it('should render OASys imported notes in a details block', () => {
      const registration = registrationFactory.build({
        description: 'Risk to Staff',
      })

      const rows = registrationRows([registration])

      expect((rows[0][1] as { html: string }).html).toContain('Nunjucks template partials/detailsBlock.njk')
      expect(render).toHaveBeenCalledWith('partials/detailsBlock.njk', {
        summaryText: `View full OASys notes for ${registration.description.toLowerCase()}`,
        text: registration.riskNotesDetail[0].note,
      })
    })

    it('should show the first line of OASys imported notes before the details block', () => {
      const registration = registrationFactory.build({
        description: 'Risk to Prisoner',
        riskNotesDetail: [
          {
            note: 'The OASys assessment of Review on 21/04/2026 identified the Risk to Prisoner to have remained Medium.\nFurther context on the risk note.',
          },
        ],
      })

      registrationRows([registration])

      expect(render).toHaveBeenCalledWith('partials/detailsBlock.njk', {
        summaryText: 'View full OASys notes for risk to prisoner',
        text: 'Further context on the risk note.',
        previewText:
          'The OASys assessment of Review on 21/04/2026 identified the Risk to Prisoner to have remained Medium.',
      })
    })

    it('Should render an error card when caseDetail request fails', () => {
      const result = ndeliusRiskCards(crn, undefined, 'failure')

      expect(result).toHaveLength(2)
      expect(result[0].html).toContain('<h2 class="govuk-heading-m">NDelius risk flags (registers)</h2>')
      expect((result[1].card.title as { text: string }).text).toEqual('NDelius risk flags')
      expect(result[1].html).toContain('We cannot load risk flag information right now')
    })

    it('Should render a not found card when caseDetail returns 404', () => {
      const result = ndeliusRiskCards(crn, undefined, 'notFound')

      expect(result).toHaveLength(2)
      expect(result[0].html).toContain('<h2 class="govuk-heading-m">NDelius risk flags (registers)</h2>')
      expect((result[1].card.title as { text: string }).text).toEqual('NDelius risk flags')
      expect(result[1].html).toContain('No risk flag information found')
    })
  })
})
