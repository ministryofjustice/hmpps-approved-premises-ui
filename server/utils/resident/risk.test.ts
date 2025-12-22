import { render } from 'nunjucks'
import { createMock } from '@golevelup/ts-jest'
import { Cas1OASysGroupName, type RiskEnvelopeStatus } from '@approved-premises/api'
import { cas1OasysGroupFactory, cas1SpaceBookingFactory, risksFactory } from '../../testutils/factories'
import { riskTabController } from './risk'
import { PersonService } from '../../services'
import { DateFormats } from '../dateUtils'
import { tableRow } from './riskUtils'
import { ErrorWithData } from '../errors'

const personService = createMock<PersonService>({})

jest.mock('nunjucks')

describe('risk tab controller', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    ;(render as jest.Mock).mockImplementation(template => `Nunjucks template ${template}`)
  })

  describe('riskTabController', () => {
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

    it('should return the risk tab card list', async () => {
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

    it('should render the page if no OASys record is returned', async () => {
      const placement = cas1SpaceBookingFactory.build()

      personService.getOasysAnswers.mockImplementation(async () => {
        throw new ErrorWithData({ status: 404 })
      })

      const result = await riskTabController({ personService, token, crn, personRisks, placement })

      expect(result.subHeading).toEqual('OASys risks')
      expect(result.cardList).toHaveLength(2)
      expect(result.cardList[0].html).toMatchStringIgnoringWhitespace('Nunjucks template partials/insetText.njk')
      expect(render).toHaveBeenCalledWith('partials/insetText.njk', {
        html: `<p class="govuk-!-margin-bottom-2">No OASys risk assessment for person added</p><p>Go to the <a href="/manage/resident/crn/placement/${placement.id}/placement/application">application</a> to view risk information for this person.</p>`,
      })

      expect(result.cardList[1].html).toMatchStringIgnoringWhitespace(
        'Nunjucks template components/riskWidgets/rosh-widget/template.njk',
      )
      expect(render).toHaveBeenCalledWith('components/riskWidgets/rosh-widget/template.njk', {
        params: personRisks.roshRisks.value,
      })
    })
  })
})
