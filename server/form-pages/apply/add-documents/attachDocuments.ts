import type { ApprovedPremisesApplication, Document } from '@approved-premises/api'
import { DataServices, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../utils/decorators'

import TasklistPage from '../../tasklistPage'

type AttachDocumentsBody = {
  selectedDocuments?: Array<Document>
}

type AttachDocumentsResponse = {
  selectedDocuments?: Array<Document>
  documentIds?: Array<string> | string
  documentDescriptions?: Record<string, string>
}

@Page({ name: 'attach-documents', bodyProperties: ['selectedDocuments'] })
export default class AttachDocuments implements TasklistPage {
  title = 'Select any additional documents that are required to support your application'

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

    const page = new AttachDocuments({ selectedDocuments }, application)
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

    this.body.selectedDocuments.forEach(document => {
      if (!document.description) {
        errors[`selectedDocuments_${document.id}`] =
          `You must enter a description for the document '${document.fileName}'`
      }
    })

    return errors
  }
}
