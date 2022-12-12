/* eslint-disable import/prefer-default-export */
import { Application, Document } from '@approved-premises/api'

const documentsFromApplication = (application: Application): Array<Document> => {
  return application.data['attach-required-documents']['attach-documents'].selectedDocuments as Array<Document>
}

export { documentsFromApplication }
