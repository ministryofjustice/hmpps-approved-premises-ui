import { render } from 'nunjucks'
import { createMock } from '@golevelup/ts-jest'
import { Cas1OASysGroupName, type OASysQuestion, type RiskEnvelopeStatus } from '@approved-premises/api'
import {
  cas1OasysGroupFactory,
  cas1SpaceBookingFactory,
  caseDetailFactory,
  risksFactory,
} from '../../testutils/factories'
import { riskTabController } from './risk'
import { PersonService } from '../../services'
import { DateFormats } from '../dateUtils'
import { oasysMetadataRow } from './riskUtils'
import { ErrorWithData } from '../errors'
import config from '../../config'

const personService = createMock<PersonService>({})

jest.mock('nunjucks')

describe('risk tab controller', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    config.flags.ndeliusRiskFlagsEnabled = true
    ;(render as jest.Mock).mockImplementation(template => `Nunjucks template ${template}`)
  })

  afterEach(() => {
    config.flags.ndeliusRiskFlagsEnabled = false
  })

  describe('riskTabController', () => {
    const roshSummary = cas1OasysGroupFactory.roshSummary().build()
    const riskManagementPlan = cas1OasysGroupFactory.riskManagementPlan().build()
    const offenceDetails = cas1OasysGroupFactory.offenceDetails().build()
    const supportingInformation = cas1OasysGroupFactory.supportingInformation().build()
    const caseDetail = caseDetailFactory.build()
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
      personService.riskProfile.mockResolvedValue(personRisks)
      const result = await riskTabController({ personService, token, crn, caseDetail })

      expect(result.subHeading).toEqual('Risk information')
      expect(result.cardList).toHaveLength(18)
      expect(result.cardList[0]).toEqual({ html: 'Nunjucks template partials/insetText.njk' })
      expect(render).toHaveBeenCalledWith('partials/insetText.njk', {
        html: `Imported from NDelius and OASys.`,
      })
      expect(result.cardList[1].html).toContain(`<h2 class="govuk-heading-m">NDelius risk flags (registers)</h2>`)
      expect(result.cardList[4].html).toMatch(`<h2 class="govuk-heading-m">OASys risk assessments</h2>`)
      expect(result.cardList[5].html).toMatch('Nunjucks template components/riskWidgets/rosh-widget/template.njk')
      expect(render).toHaveBeenCalledWith('components/riskWidgets/rosh-widget/template.njk', {
        params: personRisks.roshRisks.value,
      })
      expect(result.cardList[6].html).toMatch(`<h3 class="govuk-heading-s">Risk assessment</h3>`)
      expect(result.cardList[7]).toEqual({ html: 'Nunjucks template partials/insetText.njk' })
      expect(render).toHaveBeenCalledWith('partials/insetText.njk', {
        html: `Assessment completed on ${DateFormats.isoDateToUIDate(roshSummary?.assessmentMetadata?.dateCompleted)}`,
      })

      expect(result.cardList[8].html).toMatchStringIgnoringWhitespace(
        `${oasysMetadataRow('R10.1', 'ROSH summary', roshSummary)}Nunjucks template partials/detailsBlock.njk`,
      )

      expect(result.cardList[12].html).toMatchStringIgnoringWhitespace(
        `${oasysMetadataRow('RM32', 'OASys risk management plan', riskManagementPlan)}Nunjucks template partials/detailsBlock.njk`,
      )

      expect(result.cardList[13].html).toMatchStringIgnoringWhitespace(
        `${oasysMetadataRow('RM34', 'OASys risk management plan', riskManagementPlan)}Nunjucks template partials/detailsBlock.njk`,
      )

      expect(result.cardList[14].html).toMatchStringIgnoringWhitespace(
        `${oasysMetadataRow('2.4.1', 'OASys offence details', offenceDetails)}Nunjucks template partials/detailsBlock.njk`,
      )
    })

    describe('OASys information not available', () => {
      const placement = cas1SpaceBookingFactory.build()

      it('should render the page if no OASys record is returned', async () => {
        personService.getOasysAnswers.mockImplementation(async () => {
          throw new ErrorWithData({ status: 404 })
        })
        personService.riskProfile.mockResolvedValue(personRisks)

        const result = await riskTabController({ personService, token, crn, caseDetail, placement })
        expect(result.subHeading).toEqual('Risk information')

        expect(result.cardList).toHaveLength(18)
        expect(result.cardList[1].html).toContain('<h2 class="govuk-heading-m">NDelius risk flags (registers)</h2>')
        expect(render).toHaveBeenCalledWith('partials/insetText.njk', {
          html: `<p class="govuk-!-margin-bottom-2">No OASys risk assessment for person added</p><p>Go to the <a href="/manage/resident/crn/placement/${placement.id}/placement/application">application</a> to view risk information for this person.</p>`,
        })
      })

      it('should render the page if the OASys record has no assessment', async () => {
        personService.getOasysAnswers.mockResolvedValue({
          answers: undefined as Array<OASysQuestion>,
          group: 'roshSummary' as Cas1OASysGroupName,
          assessmentMetadata: { hasApplicableAssessment: false },
        })
        personService.riskProfile.mockResolvedValue(personRisks)

        const result = await riskTabController({ personService, token, crn, caseDetail, placement })
        expect(result.cardList).toHaveLength(8)
        expect(result.cardList[5].html).toMatchStringIgnoringWhitespace(
          'Nunjucks template components/riskWidgets/rosh-widget/template.njk',
        )
        expect(render).toHaveBeenCalledWith('components/riskWidgets/rosh-widget/template.njk', {
          params: personRisks.roshRisks.value,
        })
      })
    })
  })
})
