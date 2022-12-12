/* eslint-disable import/prefer-default-export */
import { Application, ArrayOfOASysRiskOfSeriousHarmSummaryQuestions, Document } from '@approved-premises/api'

const documentsFromApplication = (application: Application): Array<Document> => {
  return application.data['attach-required-documents']['attach-documents'].selectedDocuments as Array<Document>
}

const roshSummariesFromApplication = (application: Application): ArrayOfOASysRiskOfSeriousHarmSummaryQuestions => {
  return application.data['oasys-import']['rosh-summary'].roshSummaries as ArrayOfOASysRiskOfSeriousHarmSummaryQuestions
}

export { documentsFromApplication, roshSummariesFromApplication }
