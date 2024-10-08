import { ApprovedPremisesApplication, Document } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import { DateFormats } from '../../../server/utils/dateUtils'

import ApplyPage from './applyPage'

const additionalDocumentDescription = 'Description for additional documents'

export default class AttachDocumentsPage extends ApplyPage {
  documents: Array<Document>

  selectedDocuments: Array<Document>

  constructor(
    documents: Array<Document>,
    selectedDocuments: Array<Document>,
    application: ApprovedPremisesApplication,
  ) {
    super(
      'Select any relevant documents to support your application',
      application,
      'attach-required-documents',
      'attach-documents',
      paths.applications.show({ id: application.id }),
    )

    this.documents = documents
    this.selectedDocuments = selectedDocuments
  }

  shouldDisplayDocuments() {
    this.documents.forEach(document => {
      cy.get('tr')
        .contains(document.fileName)
        .parent()
        .parent()
        .parent()
        .within(() => {
          cy.get('td').eq(0).contains(DateFormats.isoDateToUIDate(document.createdAt))
        })
    })
  }

  shouldDisplayNoDocuments() {
    cy.get('p').contains('No documents have been imported from Delius')
  }

  completeForm() {
    this.selectedDocuments.forEach(d => {
      const textareaSelector = `textarea[name="documentDescriptions[${d.id}]"]`

      cy.get('label').contains(d.fileName).click()
      cy.get(textareaSelector).clear()
      cy.get(textareaSelector).type(d.description)
    })
    cy.get(`textarea[name="otherDocumentDetails"]`).type(additionalDocumentDescription)
  }
}
