import type { ApprovedPremisesApplication, Document } from '@approved-premises/api'
import { DataServices, type PageResponse, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../utils/decorators'

import TasklistPage from '../../tasklistPage'
import { objectFilter } from '../../../utils/utils'

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
const bodyProperties = ['selectedDocuments', 'otherDocumentDetails']
@Page({ name: 'attach-documents', bodyProperties })
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

    const page = new AttachDocuments({ ...objectFilter(body, bodyProperties), selectedDocuments }, application)
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
    const response: PageResponse = {}

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
    type ErrorIndex = keyof TaskListErrors<this>
    const errors: TaskListErrors<this> = {}
    if (this.body.selectedDocuments.length > maxDocumentsToUpload) {
      errors[`selectedDocuments_${this.body.selectedDocuments[maxDocumentsToUpload].id}` as ErrorIndex] =
        `You can only select ${maxDocumentsToUpload} documents, remove ${this.body.selectedDocuments.length - maxDocumentsToUpload} to continue.`
    }
    if (!Object.keys(errors).length) {
      this.body.selectedDocuments.forEach(document => {
        if (!document.description) {
          errors[`selectedDocuments_${document.id}` as ErrorIndex] =
            `You must enter a description for the document '${document.fileName}'`
        }
      })
    }

    return errors
  }
}
