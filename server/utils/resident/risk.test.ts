import { render } from 'nunjucks'
import { createMock } from '@golevelup/ts-jest'
import { Cas1OASysGroupName, type RiskEnvelopeStatus } from '@approved-premises/api'
import { cas1OasysGroupFactory, risksFactory } from '../../testutils/factories'
import { riskTabController, roshWidget, summaryCards, tableRow } from './risk'
import { PersonService } from '../../services'
import { DateFormats } from '../dateUtils'
import { roshRisksFactory } from '../../testutils/factories/risks'

const personService = createMock<PersonService>({})

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
      <table class="govuk-table">
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

    describe('riskTabController', () => {
      it('should return the risk tab card list', async () => {
        const roshSummary = cas1OasysGroupFactory.roshSummary().build()
        const riskManagementPlan = cas1OasysGroupFactory.riskManagementPlan().build()
        const offenceDetails = cas1OasysGroupFactory.offenceDetails().build()
        const supportingInformation = cas1OasysGroupFactory.supportingInformation().build()
        const retrieved: { status: RiskEnvelopeStatus } = { status: 'retrieved' }
        const personRisks = risksFactory.build({
          roshRisks: retrieved,
          mappa: retrieved,
          flags: retrieved,
        })
        const token = 'token'
        const crn = 'crn'

        personService.getOasysAnswers.mockImplementation(async (_, __, group: Cas1OASysGroupName) => {
          switch (group) {
            case 'roshSummary':
              return roshSummary
            case 'riskManagementPlan':
              return riskManagementPlan
            case 'offenceDetails':
              return offenceDetails
            case 'supportingInformation':
              return supportingInformation
            default:
              return null
          }
        })

        const result = await riskTabController({ personService, token, crn, personRisks })

        expect(result.subHeading).toEqual('OASys risks')
        expect(result.cardList).toHaveLength(13)
        expect(result.cardList[0].html).toMatchStringIgnoringWhitespace('Nunjucks template partials/insetText.njk')
        expect(render).toHaveBeenCalledWith('partials/insetText.njk', {
          html: `OASys last updated on ${DateFormats.isoDateToUIDate(roshSummary.assessmentMetadata.dateCompleted)}`,
        })

        expect(result.cardList[1].html).toMatchStringIgnoringWhitespace(
          'Nunjucks template components/riskWidgets/rosh-widget/template.njk',
        )
        expect(render).toHaveBeenCalledWith('components/riskWidgets/rosh-widget/template.njk', {
          params: personRisks.roshRisks.value,
        })

        expect(result.cardList[2].html).toMatchStringIgnoringWhitespace(
          `${tableRow('R10.1 ROSH summary')}Nunjucks template partials/detailsBlock.njk`,
        )

        expect(result.cardList[6].html).toMatchStringIgnoringWhitespace(
          `${tableRow('RM32 OASys risk management plan')}Nunjucks template partials/detailsBlock.njk`,
        )
        expect(result.cardList[7].html).toMatchStringIgnoringWhitespace(
          `${tableRow('2.4.1 OASys')}Nunjucks template partials/detailsBlock.njk`,
        )
        expect(result.cardList[12].html).toMatchStringIgnoringWhitespace(
          `${tableRow('9.9 OASys supporting information')}Nunjucks template partials/detailsBlock.njk`,
        )
      })
    })
  })
})
