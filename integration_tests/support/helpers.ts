import {
  ApprovedPremisesApplication,
  ArrayOfOASysOffenceDetailsQuestions,
  ArrayOfOASysRiskOfSeriousHarmSummaryQuestions,
  Document,
} from '@approved-premises/api'

const documentsFromApplication = (application: ApprovedPremisesApplication): Array<Document> => {
  return application.data['attach-required-documents']['attach-documents'].selectedDocuments as Array<Document>
}

const roshSummariesFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysRiskOfSeriousHarmSummaryQuestions => {
  return application.data['oasys-import']['rosh-summary'].roshSummaries as ArrayOfOASysRiskOfSeriousHarmSummaryQuestions
}

const offenceDetailSummariesFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysOffenceDetailsQuestions => {
  return application.data['oasys-import']['offence-details']
    .offenceDetailsSummaries as ArrayOfOASysRiskOfSeriousHarmSummaryQuestions
}

const supportInformationFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysOffenceDetailsQuestions => {
  return application.data['oasys-import']['supporting-information']
    .supportingInformationSummaries as ArrayOfOASysRiskOfSeriousHarmSummaryQuestions
}

export {
  documentsFromApplication,
  roshSummariesFromApplication,
  offenceDetailSummariesFromApplication,
  supportInformationFromApplication,
}
