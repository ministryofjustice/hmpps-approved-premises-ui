import type { ApprovedPremisesApplication, Document, PlacementApplication } from '@approved-premises/api'
import { DataServices, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../utils/decorators'

import TasklistPage from '../../tasklistPage'

const maxDocumentsToUpload = 5

type AdditionalDocumentsBody = {
  selectedDocuments?: Array<Document>
  otherDocumentDetails?: string
}

type AdditionalDocumentsResponse = {
  selectedDocuments?: Array<Document>
  documentIds?: Array<string> | string
  documentDescriptions?: Record<string, string>
  otherDocumentDetails?: string
}

@Page({ name: 'additional-documents', bodyProperties: ['selectedDocuments', 'otherDocumentDetails'] })
export default class AdditionalDocuments implements TasklistPage {
  title = 'Select any additional documents that are required to support your application'

  documents: Array<Document> | undefined

  application: ApprovedPremisesApplication

  constructor(
    public body: AdditionalDocumentsBody,
    public readonly placementApplication: PlacementApplication,
  ) {}

  static async initialize(
    body: AdditionalDocumentsResponse,
    placementApplication: PlacementApplication,
    token: string,
    dataServices: DataServices,
  ): Promise<AdditionalDocuments> {
    const application = await dataServices.applicationService.findApplication(token, placementApplication.applicationId)
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

    const page = new AdditionalDocuments({ ...body, selectedDocuments }, placementApplication)
    page.documents = documents
    page.application = application

    return page
  }

  previous() {
    return 'decision-to-release'
  }

  next() {
    return 'updates-to-application'
  }

  response() {
    const response = {
      'Additional documents': [] as Array<Record<string, string>>,
    }

    if (this.body.selectedDocuments.length === 0) {
      response['Additional documents'].push({
        'N/A': 'No documents attached',
      })
    }

    this.body.selectedDocuments.forEach(d => {
      response['Additional documents'].push({ [d.fileName]: d.description || 'No description' })
    })

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}
    if (this.body.selectedDocuments.length > maxDocumentsToUpload) {
      errors[`selectedDocuments_${this.body.selectedDocuments[maxDocumentsToUpload].id}`] =
        `You can only select ${maxDocumentsToUpload} documents, remove ${this.body.selectedDocuments.length - maxDocumentsToUpload} to continue.`
    }
    if (!Object.keys(errors).length) {
      // Only check descriptions if number of docs is OK so that the user doesn't waste their time.
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
