import { Document } from '@approved-premises/api'

import { DateFormats } from '../../../server/utils/dateUtils'

import Page from '../page'

export default class AttachDocumentsPage extends Page {
  documents: Array<Document>

  selectedDocuments: Array<Document>

  constructor(documents: Array<Document>, selectedDocuments: Array<Document>) {
    super('Select associated documents')

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

  completeForm() {
    this.selectedDocuments.forEach(d => {
      cy.get('label').contains(d.fileName).click()
      cy.get(`textarea[name="documentDescriptions[${d.id}]"]`).clear().type(d.description)
    })
  }
}
