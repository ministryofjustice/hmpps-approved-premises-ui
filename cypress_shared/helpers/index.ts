import {
  ApprovedPremisesApplication,
  ArrayOfOASysOffenceDetailsQuestions,
  ArrayOfOASysRiskManagementPlanQuestions,
  ArrayOfOASysRiskOfSeriousHarmSummaryQuestions,
  ArrayOfOASysRiskToSelfQuestions,
  ArrayOfOASysSupportingInformationQuestions,
} from '@approved-premises/api'

const roshSummariesFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysRiskOfSeriousHarmSummaryQuestions => {
  return application.data['oasys-import']['rosh-summary'].roshSummaries as ArrayOfOASysRiskOfSeriousHarmSummaryQuestions
}

const offenceDetailSummariesFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysOffenceDetailsQuestions => {
  return application.data['oasys-import']['offence-details']
    .offenceDetailsSummaries as ArrayOfOASysOffenceDetailsQuestions
}

const supportInformationFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysSupportingInformationQuestions => {
  return application.data['oasys-import']['supporting-information']
    .supportingInformationSummaries as ArrayOfOASysSupportingInformationQuestions
}

const riskManagementPlanFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysRiskManagementPlanQuestions => {
  return application.data['oasys-import']['risk-management-plan']
    .riskManagementSummaries as ArrayOfOASysRiskManagementPlanQuestions
}

const riskToSelfSummariesFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysRiskToSelfQuestions => {
  return application.data['oasys-import']['risk-to-self'].riskToSelfSummaries as ArrayOfOASysRiskToSelfQuestions
}

export {
  roshSummariesFromApplication,
  offenceDetailSummariesFromApplication,
  supportInformationFromApplication,
  riskManagementPlanFromApplication,
  riskToSelfSummariesFromApplication,
}
