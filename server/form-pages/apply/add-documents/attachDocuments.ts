import type { Application, Document } from '@approved-premises/api'
import { DataServices, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../utils/decorators'

import TasklistPage from '../../tasklistPage'

type AttachDocumentsBody = {
  selectedDocuments?: Array<Document>
}

type AttachDocumentsResponse = {
  documentIds?: Array<string> | string
}

@Page({ name: 'attach-documents', bodyProperties: ['selectedDocuments'] })
export default class AttachDocuments implements TasklistPage {
  title = 'Select associated documents'

  documents: Array<Document> | undefined

  constructor(public body: AttachDocumentsBody) {}

  static async initialize(
    body: AttachDocumentsResponse,
    application: Application,
    token: string,
    dataServices: DataServices,
  ): Promise<AttachDocuments> {
    const documents = await dataServices.applicationService.getDocuments(token, application)
    const documentIds = [body.documentIds].flat()
    const selectedDocuments = documents.filter((d: Document) => documentIds.includes(d.id))

    const page = new AttachDocuments({ selectedDocuments })
    page.documents = documents

    return page
  }

  previous() {
    return ''
  }

  next() {
    return ''
  }

  response() {
    const response = {}

    this.body.selectedDocuments.forEach(d => {
      response[d.fileName] = d.description || 'No description'
    })

    return response
  }

  errors() {
    return {}
  }
}
