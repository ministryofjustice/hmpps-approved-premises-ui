import { Adjudication, Document, PersonAcctAlert, PrisonCaseNote } from '../../server/@types/shared'
import { PersonRisksUI, SummaryListItem } from '../../server/@types/ui'
import errorLookups from '../../server/i18n/en/errors.json'
import { DateFormats } from '../../server/utils/dateUtils'
import { sentenceCase } from '../../server/utils/utils'

export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static verifyOnPage<T>(constructor: new (...args: Array<unknown>) => T, ...args: Array<unknown>): T {
    return new constructor(...args)
  }

  constructor(private readonly title: string) {
    this.checkOnPage()
    cy.injectAxe()
    // Temporary rule whilst this issue is resolved https://github.com/w3c/aria/issues/1404
    cy.configureAxe({ rules: [{ id: 'aria-allowed-attr', reviewOnFail: true }] })
    cy.checkA11y()
  }

  assertDefinition(term: string, value: string): void {
    cy.get('dt').contains(term).parents('.govuk-summary-list__row').get('dd').should('contain', value)
  }

  shouldContainSummaryListItems(items: Array<SummaryListItem>): void {
    items.forEach(item => {
      const key = 'text' in item.key ? item.key.text : item.key.html
      const value = 'text' in item.value ? item.value.text : item.value.html
      if ('text' in item.value) {
        this.assertDefinition(key, value)
      } else {
        cy.get('dt')
          .contains(key)
          .siblings('dd')
          .then($dd => {
            // Get rid of all whitespace in both the actual and expected text,
            // so we don't have to worry about small differences in whitespace
            const parser = new DOMParser()
            const doc = parser.parseFromString(value, 'text/html')

            const actual = $dd.text().replace(/\s+/g, '')
            const expected = doc.body.innerText.replace(/\s+/g, '')

            expect(actual).to.equal(expected)
          })
      }
    })
  }

  checkOnPage(): void {
    cy.get('h1').contains(this.title)
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  shouldShowErrorMessagesForFields(fields: Array<string>): void {
    fields.forEach(field => {
      cy.get('.govuk-error-summary').should('contain', errorLookups[field]?.empty)
      cy.get(`[data-cy-error-${field}]`).should('contain', errorLookups[field]?.empty)
    })
  }

  shouldShowBanner(copy: string): void {
    cy.get('.govuk-notification-banner').contains(copy)
  }

  getLabel(labelName: string): void {
    cy.get('label').should('contain', labelName)
  }

  getLegend(legendName: string): void {
    cy.get('legend').should('contain', legendName)
  }

  getTextInputByIdAndEnterDetails(id: string, details: string): void {
    cy.get(`#${id}`).type(details)
  }

  getSelectInputByIdAndSelectAnEntry(id: string, entry: string): void {
    cy.get(`#${id}`).select(entry)
  }

  checkRadioByNameAndValue(name: string, option: string): void {
    cy.get(`input[name="${name}"][value="${option}"]`).check()
  }

  checkCheckboxByNameAndValue(name: string, option: string): void {
    cy.get(`input[name="${name}"][value="${option}"]`).check()
  }

  checkCheckboxByLabel(option: string): void {
    cy.get(`input[value="${option}"]`).check()
  }

  uncheckCheckboxbyNameAndValue(name: string, option: string): void {
    cy.get(`input[name="${name}"][value="${option}"]`).uncheck()
  }

  completeTextArea(name: string, value: string): void {
    cy.get(`textarea[name="${name}"]`).type(value)
  }

  completeDateInputs(prefix: string, date: string): void {
    const parsedDate = DateFormats.isoToDateObj(date)
    cy.get(`#${prefix}-day`).type(parsedDate.getDate().toString())
    cy.get(`#${prefix}-month`).type(`${parsedDate.getMonth() + 1}`)
    cy.get(`#${prefix}-year`).type(parsedDate.getFullYear().toString())
  }

  clickSubmit(): void {
    cy.get('button').click()
  }

  clickBack(): void {
    cy.get('a').contains('Back').click()
  }

  shouldShowMappa = (): void => {
    cy.get('h3').contains('MAPPA')
    cy.get('h3').contains('CAT 2 / LEVEL 1')
  }

  shouldShowRosh = (risks: PersonRisksUI['roshRisks']): void => {
    cy.get('h3').contains(`${risks.overallRisk.toLocaleUpperCase()} RoSH`)
    cy.get('p').contains(`Last updated: ${risks.lastUpdated}`)

    cy.get('.rosh-widget__table').within($row => {
      cy.wrap($row).get('th').contains('Children').get('td').contains(risks.riskToChildren, { matchCase: false })
      cy.wrap($row).get('th').contains('Public').get('td').contains(risks.riskToPublic, { matchCase: false })
      cy.wrap($row).get('th').contains('Known adult').get('td').contains(risks.riskToKnownAdult, { matchCase: false })
      cy.wrap($row).get('th').contains('Staff').get('td').contains(risks.riskToStaff, { matchCase: false })
    })
  }

  shouldShowTier = (tier: PersonRisksUI['tier']): void => {
    cy.get('h3').contains(`TIER ${tier.level}`)
    cy.get('p').contains(`Last updated: ${tier.lastUpdated}`)
  }

  shouldShowDeliusRiskFlags = (flags: Array<string>): void => {
    cy.get('h3').contains(`Delius risk flags (registers)`)
    cy.get('.risk-flag-widget > ul').within($item => {
      flags.forEach(flag => {
        cy.wrap($item).get('li').should('contain', flag)
      })
    })
  }

  shouldShowRiskWidgets(risks: PersonRisksUI): void {
    this.shouldShowMappa()
    this.shouldShowRosh(risks.roshRisks)
    this.shouldShowTier(risks.tier)
    this.shouldShowDeliusRiskFlags(risks.flags)
  }

  completeOasysImportQuestions(section, sectionName: string): void {
    section.forEach(summary => {
      cy.get('.govuk-label').contains(summary.label)
      cy.get(`textarea[name="${sectionName}[${summary.questionNumber}]"]`)
        .should('contain', summary.answer)
        .type(`. With an extra comment ${summary.questionNumber}`)
    })
  }

  shouldBeAbleToDownloadDocuments(documents: Array<Document>) {
    documents.forEach(document => {
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

  shouldShowCheckYourAnswersTitle(taskName: string, taskTitle: string) {
    cy.get(`[data-cy-section="${taskName}"]`).within(() => {
      cy.get('.govuk-summary-card__title').should('contain', taskTitle)
    })
  }

  shouldDisplayAdjudications(adjudications: Array<Adjudication>) {
    cy.get('a').contains('Adjudications').click()

    adjudications.forEach(adjudication => {
      cy.get('tr')
        .contains(adjudication.id)
        .parent()
        .within(() => {
          cy.get('td').eq(1).contains(DateFormats.isoDateTimeToUIDateTime(adjudication.reportedAt))
          cy.get('td').eq(2).contains(adjudication.establishment)
          cy.get('td').eq(3).contains(adjudication.offenceDescription)
          cy.get('td')
            .eq(4)
            .contains(sentenceCase(adjudication?.finding || ''))
        })
    })
  }

  shouldDisplayPrisonCaseNotes(prisonCaseNotes: Array<PrisonCaseNote>) {
    prisonCaseNotes.forEach(caseNote => {
      cy.get('tr')
        .contains(DateFormats.isoDateToUIDate(caseNote.createdAt))
        .parent()
        .within(() => {
          cy.get('td').eq(1).contains(caseNote.type).contains(caseNote.subType)
          cy.get('td')
            .eq(1)
            .contains(sentenceCase(caseNote.note || ''))
        })
    })
  }

  shouldDisplayAcctAlerts(acctAlerts: Array<PersonAcctAlert>) {
    cy.get('a').contains('ACCT').click()
    acctAlerts.forEach(acctAlert => {
      cy.get('tr')
        .contains(`${acctAlert.alertId}`)
        .parent()
        .within(() => {
          cy.get('td').eq(1).contains(acctAlert.comment)
          cy.get('td').eq(2).contains(DateFormats.isoDateToUIDate(acctAlert.dateCreated))
          cy.get('td')
            .eq(3)
            .contains(DateFormats.isoDateToUIDate(acctAlert.dateExpires as string))
        })
    })
  }

  clearDateInputs(prefix: string): void {
    cy.get(`#${prefix}-day`).clear()
    cy.get(`#${prefix}-month`).clear()
    cy.get(`#${prefix}-year`).clear()
  }

  getTextInputByIdAndClear(id: string): void {
    cy.get(`#${id}`).clear()
  }
}
