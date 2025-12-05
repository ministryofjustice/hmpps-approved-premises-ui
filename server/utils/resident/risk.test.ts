import { render } from 'nunjucks'
import { createMock } from '@golevelup/ts-jest'
import { Cas1OASysGroupName } from '@approved-premises/api'
import { cas1OasysGroupFactory } from '../../testutils/factories'
import { riskTabController, summaryCards, tableRow } from './risk'
import { PersonService } from '../../services'
import { DateFormats } from '../dateUtils'

const personService = createMock<PersonService>({})

jest.mock('nunjucks')
describe('risk utils', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    ;(render as jest.Mock).mockReturnValue('rendered-output')
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
      </table>rendered-output`)
      })
    })

    describe('riskTabController', () => {
      it('should return the risk tab card list', async () => {
        const roshSummary = cas1OasysGroupFactory.roshSummary().build()
        const riskManagementPlan = cas1OasysGroupFactory.riskManagementPlan().build()
        const offenceDetails = cas1OasysGroupFactory.offenceDetails().build()
        const supportingInformation = cas1OasysGroupFactory.supportingInformation().build()
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

        const result = await riskTabController({ personService, token, crn })

        expect(result.subHeading).toEqual('OASys risks')
        expect(result.cardList).toHaveLength(12)
        expect(result.cardList[0].html).toMatchStringIgnoringWhitespace(
          `OASys last updated on ${DateFormats.isoDateToUIDate(roshSummary.assessmentMetadata.dateCompleted)}`,
        )
        expect(result.cardList[1].html).toMatchStringIgnoringWhitespace(
          `${tableRow('R10.1 ROSH summary')}rendered-output`,
        )
        expect(result.cardList[5].html).toMatchStringIgnoringWhitespace(
          `${tableRow('RM32 OASys risk management plan')}rendered-output`,
        )
        expect(result.cardList[6].html).toMatchStringIgnoringWhitespace(`${tableRow('2.4.1 OASys')}rendered-output`)
        expect(result.cardList[11].html).toMatchStringIgnoringWhitespace(
          `${tableRow('9.9 OASys supporting information')}rendered-output`,
        )
      })
    })
  })
})
