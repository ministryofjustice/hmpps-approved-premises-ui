import { Cas1OASysGroup, PersonRisks } from '@approved-premises/api'
import { JourneyType, TaskWithStatus } from '@approved-premises/ui'
import { card, insetText, TabData } from './index'
import { TabControllerParameters } from './TabControllerParameters'
import { ndeliusRiskCards, riskOasysCards } from './riskUtils'
import { linkTo, settlePromisesWithOutcomes } from '../utils'
import TasklistService from '../../services/tasklistService'
import managePaths from '../../paths/manage'
import { summaryListItem } from '../formUtils'
import { DateFormats } from '../dateUtils'

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
    personService.getOasysAnswers(token, crn, 'roshSummary', 'allow_all'),
    personService.getOasysAnswers(token, crn, 'riskManagementPlan', 'allow_all'),
    personService.getOasysAnswers(token, crn, 'offenceDetails', 'allow_all'),
    personService.riskProfile(token, crn),
  ])
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

export const placementRisksController = async ({ crn, placement, profileData }: TabControllerParameters) => {
  const {
    'risk-information': {
      'risk-to-staff': { riskToStaffSummary } = {},
      'risk-to-residents': { riskToResidentsSummary } = {},
      lastUpdated,
    } = {},
    preArrivalTasksComplete: showData,
  } = profileData || {}

  const journey: JourneyType = 'pre-arrival'
  const taskList = new TasklistService(
    undefined,
    journey,
    profileData,
    `${managePaths.resident.show({ placementId: placement.id, crn })}/tasks/${'profile'}`,
  )
  const section: TaskWithStatus = taskList.sections
    .map(({ tasks }) => {
      return tasks.find(task => task.id === 'risk-information')
    })
    .find(task => !!task)

  const tasklistLink = linkTo(managePaths.resident.taskList({ placementId: placement.id, crn, journey }), {
    text: 'pre-arrival tasks',
  })
  const lastUpdatedMessage = lastUpdated
    ? `<p class="govuk-!-margin-top-4 govuk-hint">Last updated on ${DateFormats.isoDateTimeToUIDateTime(lastUpdated, { formatStr: "iiii d MMM y 'at' HH:mm" })}<p>`
    : ''

  return {
    subHeading: 'Placement risks',
    cardList: [
      card({
        title: 'Placement risks',
        rows: showData && [
          summaryListItem('Risk to staff', riskToStaffSummary, 'textBlock'),
          summaryListItem('Risk to residents', riskToResidentsSummary, 'textBlock'),
        ],
        actions: showData && { items: [{ text: 'Change', href: section?.link }] },
        html: !showData
          ? `This information will be available when the ${tasklistLink} are complete.`
          : lastUpdatedMessage,
      }),
    ],
  }
}
