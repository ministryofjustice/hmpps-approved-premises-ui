import type { ApprovedPremisesApplication, Document } from '@approved-premises/api'
import { DataServices, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../utils/decorators'

import TasklistPage from '../../tasklistPage'

const maxDocumentsToUpload = 5

type AttachDocumentsBody = {
  selectedDocuments?: Array<Document>
  otherDocumentDetails?: string
}

type AttachDocumentsResponse = {
  selectedDocuments?: Array<Document>
  documentIds?: Array<string> | string
  documentDescriptions?: Record<string, string>
  otherDocumentDetails?: string
}

@Page({ name: 'attach-documents', bodyProperties: ['selectedDocuments', 'otherDocumentDetails'] })
export default class AttachDocuments implements TasklistPage {
  title = 'Select any relevant documents to support your application'

  documents: Array<Document> | undefined

  constructor(
    public body: AttachDocumentsBody,
    public readonly application: ApprovedPremisesApplication,
  ) {}

  static async initialize(
    body: AttachDocumentsResponse,
    application: ApprovedPremisesApplication,
    token: string,
    dataServices: DataServices,
  ): Promise<AttachDocuments> {
    const documents = await dataServices.applicationService.getDocuments(token, application)
    const documentIds = [body.documentIds].flat()
    const documentDescriptions = body.documentDescriptions || {}

    const selectedDocuments = body.selectedDocuments
      ? body.selectedDocuments
      : documents
          .filter((d: Document) => documentIds.includes(d.id))
          .map(document => {
            return {
              ...document,
              description: documentDescriptions[document.id],
            }
          })

    const page = new AttachDocuments({ ...body, selectedDocuments }, application)
    page.documents = documents

    return page
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return ''
  }

  response() {
    const response = {}

    if (this.body.selectedDocuments.length === 0) {
      return {
        'N/A': 'No documents attached',
      }
    }
    this.body.selectedDocuments.forEach(d => {
      response[d.fileName] = d.description || 'No description'
    })
    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}
    // Check number of docs selected is docs is OK.
    if (this.body.selectedDocuments.length > maxDocumentsToUpload) {
      errors[`selectedDocuments_${this.body.selectedDocuments[maxDocumentsToUpload].id}`] =
        `You can only select ${maxDocumentsToUpload} documents, remove ${this.body.selectedDocuments.length - maxDocumentsToUpload} to continue.`
    }
    if (!Object.keys(errors).length) {
      // Only check descriptions if number of docs is OK so that the user doesn't waste their time adding descriptions.
      this.body.selectedDocuments.forEach(document => {
        if (!document.description) {
          errors[`selectedDocuments_${document.id}`] =
            `You must enter a description for the document '${document.fileName}'`
        }
      })
    }

    return errors
  }
}
