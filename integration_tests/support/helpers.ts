/* eslint-disable import/prefer-default-export */
import {
  ApprovedPremisesApplication,
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

export { documentsFromApplication, roshSummariesFromApplication }
