import { render } from 'nunjucks'
import { cas1OasysGroupFactory } from '../../testutils/factories'
import { drugAndAlcoholCards } from './drugAndAlcoholUtils'
import { oasysMetadataRow } from './riskUtils'

jest.mock('nunjucks')

describe('drugAndAlcoholUtils', () => {
  beforeEach(() => {
    ;(render as jest.Mock).mockImplementation((templatePath: string) => `Nunjucks template ${templatePath}`)
  })

  describe('drug and alcohol cards', () => {
    it('should render the drug and alcohol cards', () => {
      const supportingInformation = cas1OasysGroupFactory.supportingInformation().build()

      const result = drugAndAlcoholCards(supportingInformation)
      expect(result[0]).toEqual({ html: 'Nunjucks template partials/insetText.njk' })
      expect(render).toHaveBeenCalledWith('partials/insetText.njk', { html: 'Imported from OASys' })

      expect(result[1].html).toMatchStringIgnoringWhitespace(
        `${oasysMetadataRow('8.9', 'OASys supporting information', supportingInformation)}Nunjucks template partials/detailsBlock.njk`,
      )
      expect(result[2].html).toMatchStringIgnoringWhitespace(
        `${oasysMetadataRow('9.9', 'OASys supporting information', supportingInformation)}Nunjucks template partials/detailsBlock.njk`,
      )

      supportingInformation.answers.forEach(answer => {
        if (['8.9', '9.9'].includes(answer.questionNumber))
          expect(render).toHaveBeenCalledWith('partials/detailsBlock.njk', {
            summaryText: 'View information',
            text: answer.answer,
          })
      })
    })
  })
})
