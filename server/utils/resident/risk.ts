import { Cas1OASysGroup, PersonRisks } from '@approved-premises/api'
import { card, insetText, TabData } from './index'
import { TabControllerParameters } from './TabControllerParameters'
import { ndeliusRiskCards, riskOasysCards } from './riskUtils'
import { settlePromisesWithOutcomes } from '../utils'

export const riskTabController = async ({
  personService,
  token,
  crn,
  caseDetail,
  caseDetailOutcome,
  placement,
}: TabControllerParameters): Promise<TabData> => {
  const {
    values: [roshSummary, riskManagementPlan, offenceDetails, personRisks],
    outcomes: [roshResult, rmResult, offenceResult],
  } = await settlePromisesWithOutcomes<[Cas1OASysGroup, Cas1OASysGroup, Cas1OASysGroup, PersonRisks]>([
    personService.getOasysAnswers(token, crn, 'roshSummary'),
    personService.getOasysAnswers(token, crn, 'riskManagementPlan'),
    personService.getOasysAnswers(token, crn, 'offenceDetails'),
    personService.riskProfile(token, crn),
  ])
  // roshSummary.assessmentMetadata.hasApplicableAssessment = false
  return {
    subHeading: 'Risk information',
    cardList: [
      card({ html: insetText('Imported from NDelius and OASys.') }),
      ...ndeliusRiskCards(crn, caseDetail?.registrations, caseDetailOutcome),
      ...riskOasysCards({
        crn,
        placement,
        personRisks,
        roshSummary,
        roshResult,
        riskManagementPlan,
        rmResult,
        offenceDetails,
        offenceResult,
      }),
    ],
  }
}
