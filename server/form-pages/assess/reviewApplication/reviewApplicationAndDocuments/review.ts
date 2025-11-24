import type { DataServices, TaskListErrors } from '@approved-premises/ui'
import { Cas1Assessment as Assessment, Document } from '@approved-premises/api'

import { Page } from '../../../utils/decorators'
import TasklistPage from '../../../tasklistPage'
import { documentsFromApplication, overwriteApplicationDocuments } from '../../../../utils/assessments/documentUtils'
import { sentenceCase } from '../../../../utils/utils'

@Page({ name: 'review', bodyProperties: ['reviewed'] })
export default class Review implements TasklistPage {
  name = 'review'

  title = 'Review application'

  question = 'Have you reviewed all of the application and documents provided?'

  constructor(
    public body: { reviewed?: string },
    private readonly assessment: Assessment,
  ) {}

  static async initialize(
    body: Record<string, unknown>,
    assessment: Assessment,
    token: string,
    dataServices: DataServices,
  ) {
    const documents = await dataServices.applicationService.getDocuments(token, assessment.application)
    const selectedDocuments: Array<Document> = []

    documentsFromApplication(assessment.application).forEach(selectedDocument => {
      const foundDocument = documents.find((document: Document) => document.fileName === selectedDocument.fileName)
      if (foundDocument) selectedDocuments.push(foundDocument)
    })

    if (selectedDocuments.length) {
      assessment.application = overwriteApplicationDocuments(assessment.application, selectedDocuments)
    }

    return new Review(body, assessment)
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return ''
  }

  response() {
    return { [this.question]: sentenceCase(this.body.reviewed) }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.reviewed || this.body.reviewed === 'no')
      errors.reviewed = 'You must review all of the application and documents provided before proceeding'

    return errors
  }
}
