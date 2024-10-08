import { Document } from '@approved-premises/api'
import { DateFormats } from '../../../../server/utils/dateUtils'
import Page from '../../page'

const additionalDocumentDescription = 'Description for additional documents'

export default class AdditionalDocuments extends Page {
  documents: Array<Document>

  selectedDocuments: Array<Document>

  constructor(documents: Array<Document>, selectedDocuments: Array<Document>) {
    super('Select any additional documents that are required to support your application')

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
      const textareaSelector = `textarea[name="documentDescriptions[${d.id}]"]`

      cy.get('label').contains(d.fileName).click()
      cy.get(textareaSelector).clear()
      cy.get(textareaSelector).type(d.description)
    })
    // Complete the additional text area
    cy.get(`textarea[name="otherDocumentDetails"]`).type(additionalDocumentDescription)
  }
}
