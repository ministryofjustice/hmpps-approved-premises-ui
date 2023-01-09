import { ApprovedPremisesApplication, Document } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import { DateFormats } from '../../../server/utils/dateUtils'

import ApplyPage from './applyPage'

export default class AttachDocumentsPage extends ApplyPage {
  documents: Array<Document>

  selectedDocuments: Array<Document>

  constructor(
    documents: Array<Document>,
    selectedDocuments: Array<Document>,
    application: ApprovedPremisesApplication,
  ) {
    super(
      'Select associated documents',
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

  shouldBeAbleToDownloadDocuments() {
    this.documents.forEach(document => {
      // This is a hack to stop `cy.click()` from waiting for a page load
      // See: https://github.com/cypress-io/cypress/issues/14857
      cy.window()
        .document()
        .then(doc => {
          doc.addEventListener('click', () => {
            setTimeout(() => {
              doc.location.reload()
            }, 300)
          })
          cy.get(`a[data-cy-documentId="${document.id}"]`).click()
        })

      const downloadsFolder = Cypress.config('downloadsFolder')
      const downloadedFilename = `${downloadsFolder}/${document.fileName}`
      cy.readFile(downloadedFilename, 'binary', { timeout: 300 })
    })
  }

  completeForm() {
    this.selectedDocuments.forEach(d => {
      cy.get('label').contains(d.fileName).click()
      cy.get(`textarea[name="documentDescriptions[${d.id}]"]`).clear().type(d.description)
    })
  }
}
