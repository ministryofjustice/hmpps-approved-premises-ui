import type { ApprovedPremisesApplication, Document, PlacementApplication } from '@approved-premises/api'
import { DataServices, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../utils/decorators'

import TasklistPage from '../../tasklistPage'

type AdditionalDocumentsBody = {
  selectedDocuments?: Array<Document>
}

type AdditionalDocumentsResponse = {
  selectedDocuments?: Array<Document>
  documentIds?: Array<string> | string
  documentDescriptions?: Record<string, string>
}

@Page({ name: 'additional-documents', bodyProperties: ['selectedDocuments'] })
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

    const page = new AdditionalDocuments({ selectedDocuments }, placementApplication)
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

    this.body.selectedDocuments.forEach(document => {
      if (!document.description) {
        errors[`selectedDocuments_${document.id}`] =
          `You must enter a description for the document '${document.fileName}'`
      }
    })

    return errors
  }
}
