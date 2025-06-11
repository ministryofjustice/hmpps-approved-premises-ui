import { KeyDetailsArgs, PersonRisksUI, SummaryListItem, TableCell } from '@approved-premises/ui'
import {
  Adjudication,
  ApprovedPremisesApplication as Application,
  ApprovedPremisesAssessment as Assessment,
  Cas1TimelineEvent,
  Document,
  FullPerson,
  Cas1OutOfServiceBed as OutOfServiceBed,
  Cas1OutOfServiceBedRevision as OutOfServiceBedRevision,
  Person,
  PersonAcctAlert,
  PersonStatus,
  Cas1PlacementRequestDetail,
  PrisonCaseNote,
  SortOrder,
} from '@approved-premises/api'
import errorLookups from '../../server/i18n/en/errors.json'
import { summaryListSections } from '../../server/utils/applications/summaryListUtils'
import { DateFormats } from '../../server/utils/dateUtils'
import { sentenceCase } from '../../server/utils/utils'
import { SubmittedDocumentRenderer } from '../../server/utils/forms/submittedDocumentRenderer'
import { eventTypeTranslations } from '../../server/utils/applications/utils'
import { displayName, isFullPerson } from '../../server/utils/personUtils'

export type PageElement = Cypress.Chainable<JQuery>

export const parseHtml = (actual: JQuery<HTMLElement>, expected: string) => {
  // Get rid of all whitespace in both the actual and expected text,
  // so we don't have to worry about small differences in whitespace
  const parser = new DOMParser()
  const doc = parser.parseFromString(expected, 'text/html')

  return { actual: actual.text().replace(/\s+/g, ''), expected: doc.body.innerText.replace(/\s+/g, '') }
}

export default abstract class Page {
  static verifyOnPage<T>(constructor: new (...args: Array<unknown>) => T, ...args: Array<unknown>): T {
    return new constructor(...args)
  }

  constructor(private readonly title: string) {
    this.checkOnPage()
    cy.injectAxe()
    cy.configureAxe({
      rules: [
        // Temporary rule whilst this issue is resolved https://github.com/w3c/aria/issues/1404
        { id: 'aria-allowed-attr', reviewOnFail: true },
        // Ignore the "All page content should be contained by landmarks", which conflicts with GOV.UK guidance (https://design-system.service.gov.uk/components/back-link/#how-it-works)
        { id: 'region', reviewOnFail: true, selector: '.govuk-back-link' },
      ],
    })
    cy.checkA11y()
  }

  assertDefinition(term: string, value: string): void {
    cy.get('dt').contains(term).parents('.govuk-summary-list__row').get('dd').should('contain', value)
  }

  shouldContainSummaryListItems(items: Array<SummaryListItem>): void {
    items.forEach(item => {
      const key = 'text' in item.key ? item.key.text : item.key.html
      const value = 'text' in item.value ? item.value.text : item.value.html
      if ('text' in item.key && 'text' in item.value) {
        this.assertDefinition(key, value)
      } else if ('text' in item.key && 'html' in item.value) {
        cy.get('dt')
          .contains(key)
          .siblings('dd')
          .then($dd => {
            const { actual, expected } = parseHtml($dd, value)

            expect(actual).to.equal(expected)
          })
      } else {
        cy.get('dd')
          .contains(value)
          .siblings('dt')
          .then($dt => {
            const { actual, expected } = parseHtml($dt, key)
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

  shouldShowErrorMessagesForFields(fields: Array<string>, clientSideErrorMessages?: Record<string, string>): void {
    fields.forEach(field => {
      const errorMessagesLookup = clientSideErrorMessages?.[field] ?? errorLookups[field].empty

      cy.get('.govuk-error-summary').should('contain', errorMessagesLookup)
      cy.get(`[data-cy-error-${field}]`).should('contain', errorMessagesLookup)
    })
  }

  private elementShouldContainText(selector: string, text: string, options: { exact: boolean }) {
    cy.get(selector).then(bannerElement => {
      const { actual, expected } = parseHtml(bannerElement, text)

      if (options.exact) {
        expect(actual).to.equal(expected)
      } else {
        expect(actual).to.contain(expected)
      }
    })
  }

  shouldShowBanner(text: string, options: { exact: boolean } = { exact: true }): void {
    return this.elementShouldContainText('.govuk-notification-banner__content', text, options)
  }

  shouldNotShowBanner(): void {
    cy.get('.govuk-notification-banner').should('not.exist')
  }

  shouldShowTicketPanel(text: string, options: { exact: boolean } = { exact: true }): void {
    return this.elementShouldContainText('.moj-ticket-panel__content', text, options)
  }

  shouldNotShowTicketPanel(): void {
    cy.get('.moj-ticket-panel__content').should('not.exist')
  }

  radioByNameAndValueShouldNotExist(name: string, option: string): void {
    cy.get(`input[name = "${name}"][value = "${option}"]`).should('not.exist')
  }

  getLabel(labelName: string): void {
    cy.get('label').should('contain', labelName)
  }

  getLegend(legendName: string): void {
    cy.get('legend').should('contain', legendName)
  }

  getHint(hint: string): void {
    cy.get('.govuk-hint').should('contain', hint)
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

  checkCheckboxByValue(option: string): void {
    cy.get(`input[value="${option}"]`).check()
  }

  checkCheckboxByLabel(label: string): void {
    cy.get('label').contains(label).parent().find('input').check()
  }

  uncheckCheckboxbyNameAndValue(name: string, option: string): void {
    cy.get(`input[name="${name}"][value="${option}"]`).uncheck()
  }

  uncheckAllCheckboxesByName(name: string): void {
    cy.get(`input[name="${name}"]`).uncheck()
  }

  completeTextInput(name: string, value: string): void {
    cy.get(`input[name="${name}"]`).type(value)
  }

  completeTextArea(name: string, value: string): void {
    cy.get(`textarea[name="${name}"]`).clear()
    cy.get(`textarea[name="${name}"]`).type(value)
  }

  completeAutocompleteInput(id: string, optionLabel: string): void {
    cy.get(`input[id="${id}"]`).type(optionLabel.slice(0, 3))
    cy.get('.autocomplete__option').contains(optionLabel).click()
  }

  completeDateInputs(prefix: string, date: string): void {
    const [year, month, day] = date.split('-')

    if (day) cy.get(`#${prefix}-day`).type(day)
    if (month) cy.get(`#${prefix}-month`).type(month)
    if (year) cy.get(`#${prefix}-year`).type(year)
  }

  completeDatePicker(name: string, date: string): void {
    const formattedDate = date.split('-').reverse().join('/')
    this.completeTextInput(name, formattedDate)
  }

  private stripLeadingZeros(value: string): string {
    return value.replace(/^0+/, '')
  }

  dateInputsShouldContainDate(prefix: string, date: string): void {
    const [year, month, day] = date.split('-').map(this.stripLeadingZeros)

    cy.get(`#${prefix}-day`).invoke('val').then(this.stripLeadingZeros).should('equal', day)
    cy.get(`#${prefix}-month`).invoke('val').then(this.stripLeadingZeros).should('equal', month)
    cy.get(`#${prefix}-year`).invoke('val').then(this.stripLeadingZeros).should('equal', year)
  }

  clickButton(text: string): void {
    cy.get('button').contains(text).click()
  }

  clickSubmit(): void {
    cy.get('button').click()
  }

  clickContinue(): void {
    cy.get('button').contains('Continue').click()
  }

  clickLink(text: string): void {
    cy.get('a').contains(text).click()
  }

  clickBack(): void {
    this.clickLink('Back')
  }

  clickOpenActionsMenu() {
    cy.get('.moj-button-menu__toggle-button').should('contain.text', 'Actions').click()
  }

  clickAction(actionLabel: string): void {
    this.clickOpenActionsMenu()
    cy.get('.moj-button-menu').contains(actionLabel).click()
  }

  actionShouldNotExist(actionLabel: string): void {
    this.clickOpenActionsMenu()
    cy.get('.moj-button-menu').contains(actionLabel).should('not.exist')
  }

  actionMenuShouldNotExist(): void {
    cy.get('.moj-button-menu > button').should('not.exist')
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

  completeOasysImportQuestions(section, sectionName: string, oasysMissing: boolean): void {
    section.forEach(summary => {
      cy.get('.govuk-label').contains(summary.label)
      if (oasysMissing) {
        cy.get(`textarea[name="${sectionName}[${summary.questionNumber}]"]`).type(
          `${summary.questionNumber} content goes here`,
        )
      } else {
        cy.get(`textarea[name="${sectionName}[${summary.questionNumber}]"]`)
          .should('contain', summary.answer)
          .type(`. With an extra comment ${summary.questionNumber}`)
      }
    })
  }

  shouldBeAbleToDownloadDocuments(documents: Array<Document>) {
    documents.forEach(document => {
      // Test debounce on download links
      cy.clock()
      cy.get(`a[data-cy-documentId="${document.id}"]`).click()
      cy.get(`a[data-cy-documentId="${document.id}"]`).should('have.class', 'link-disabled')
      cy.tick(4000)
      cy.get(`a[data-cy-documentId="${document.id}"]`).should('not.have.class', 'link-disabled')
      cy.clock().invoke('restore')
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

  shouldShowResponseFromSubmittedApplication(application: Application) {
    const sections = new SubmittedDocumentRenderer(application).response

    sections.forEach(section => {
      cy.get('h2.govuk-heading-l').contains(section.title).should('exist')
      section.tasks.forEach(task => {
        cy.get(`[data-cy-section="${task.card.attributes['data-cy-section']}"]`).within(() => {
          cy.get('.govuk-summary-card__title').contains(task.card.title.text).should('exist')
          this.shouldContainSummaryListItems(task.rows)
        })
      })
    })
  }

  shouldShowCheckYourAnswersResponses(applicationOrAssessment: Application | Assessment) {
    const sections = summaryListSections(applicationOrAssessment, false)

    sections.forEach(section => {
      cy.get('h2.govuk-heading-l').contains(section.title).should('exist')
      section.tasks.forEach(task => {
        cy.get(`[data-cy-section="${task.card.attributes['data-cy-section']}"]`).within(() => {
          cy.get('.govuk-summary-card__title').contains(task.card.title.text).should('exist')
          this.shouldContainSummaryListItems(task.rows)
        })
      })
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
        .contains(`${acctAlert.alertTypeDescription}`)
        .parent()
        .within(() => {
          cy.get('td').eq(1).contains(acctAlert.description)
          cy.get('td').eq(2).contains(DateFormats.isoDateToUIDate(acctAlert.dateCreated))
          cy.get('td')
            .eq(3)
            .contains(DateFormats.isoDateToUIDate(acctAlert.dateExpires as string))
        })
    })
  }

  clearAllInputs() {
    cy.get('input').filter(':visible').clear()
    cy.get('textarea').clear()
  }

  clearDateInputs(prefix: string): void {
    cy.get(`#${prefix}-day`).clear()
    cy.get(`#${prefix}-month`).clear()
    cy.get(`#${prefix}-year`).clear()
  }

  clearDateInputsByName(prefix: string): void {
    cy.get(`[name="${prefix}-day"]`).clear()
    cy.get(`[name="${prefix}-month"]`).clear()
    cy.get(`[name="${prefix}-year"]`).clear()
  }

  clearAndCompleteDateInputs(prefix: string, date: string): void {
    this.clearDateInputs(prefix)
    this.completeDateInputs(prefix, date)
  }

  getTextInputByIdAndClear(id: string): void {
    cy.get(`#${id}`).clear()
  }

  verifyTextInputContentsById(id: string, value: string): void {
    cy.get(`#${id}`).should('have.value', value)
  }

  verifyRadioInputByName(name: string, value: string): void {
    cy.get(`[name="${name}"][value="${value}"]`).should('be.checked')
  }

  verifyCheckboxByLabel(label: string, checked = true) {
    cy.get('label')
      .contains(label)
      .parent()
      .find('input')
      .should(checked ? 'be.checked' : 'not.be.checked')
  }

  clearAndCompleteTextInputById(id: string, text: string): void {
    this.getTextInputByIdAndClear(id)
    this.getTextInputByIdAndEnterDetails(id, text)
  }

  shouldContainTableRows(rows: Array<Array<TableCell>>): void {
    cy.get('tbody tr').should('have.length', rows.length)

    rows.forEach(row => {
      cy.contains(this.textOrHtmlFromTableCell(row[0]))
        .parent()
        .within(() => {
          const cols = row.slice(1)
          cols.forEach((column, i) => {
            if ('text' in column) {
              cy.get('td').eq(i).contains(column.text)
            } else if ('html' in column) {
              cy.get('td')
                .eq(i)
                .then($td => {
                  const { actual, expected } = parseHtml($td, column.html)
                  expect(actual).to.equal(expected)
                })
            }
          })
        })
    })
  }

  textOrHtmlFromTableCell(tableCell: TableCell): string {
    if ('text' in tableCell) {
      return tableCell.text
    }

    return tableCell.html
  }

  checkPhaseBanner(copy: string): void {
    cy.get('[data-cy-phase-banner="phase-banner"]').contains(copy)
  }

  checkForBackButton(path: string) {
    cy.get('.govuk-back-link').should('have.attr', 'href').and('include', path)
  }

  expectDownload(): void {
    // This is a workaround for a Cypress bug to prevent it waiting
    // indefinitely for a new page to load after clicking the download link
    // See https://github.com/cypress-io/cypress/issues/14857
    cy.window()
      .document()
      .then(doc => {
        doc.addEventListener('click', () => {
          setTimeout(() => {
            doc.location?.reload()
          }, Cypress.config('defaultCommandTimeout'))
        })
      })
  }

  shouldNotShowManageActions() {
    cy.get('.moj-button-menu__toggle-button').should('not.exist')
  }

  public shouldShowRestrictedCrnMessage(person: Person): void {
    cy.get('.govuk-error-summary').should('contain', `CRN: ${person.crn} is restricted`)
    cy.get(`[data-cy-error-crn]`).should('contain', `CRN: ${person.crn} is restricted`)
  }

  clickNext(): void {
    cy.get('a[rel="next"]').click()
  }

  clickPageNumber(pageNumber: string): void {
    cy.get('.govuk-pagination__link').contains(pageNumber).click()
  }

  clickSortBy(field: string): void {
    cy.get(`th[data-cy-sort-field="${field}"] a`).click()
  }

  clickSortByColumn(columnHeading: string): void {
    cy.contains('th a', columnHeading).click()
  }

  searchBy(id: string, item: string): void {
    this.getSelectInputByIdAndSelectAnEntry(id, item)
  }

  clickApplyFilter(): void {
    cy.get('button').contains('Apply filters').click()
  }

  shouldBeSortedByColumn(columnHeading: string, order: SortOrder): void {
    cy.contains('th', columnHeading).should('have.attr', 'aria-sort', order)
  }

  shouldBeSortedByField(field: string, order: SortOrder): void {
    cy.get(`th[data-cy-sort-field="${field}"]`).should('have.attr', 'aria-sort', order)
  }

  shouldShowKeyDetails(keyDetails: KeyDetailsArgs): void {
    if (keyDetails.header.showKey) {
      cy.get('.key-details-bar__top-block').contains(keyDetails.header.key)
    }
    cy.get('.key-details-bar__name').contains(keyDetails.header.value)

    keyDetails.items.forEach(item => {
      if (item.key) {
        if ('text' in item.key) {
          cy.get('.key-details-bar__bottom-block').contains(item.key.text)
        } else if ('html' in item.key) {
          const { html } = item.key
          cy.get('.key-details-bar__bottom-block').then($el => {
            const { actual, expected } = parseHtml($el, html)
            expect(actual).to.contain(expected)
          })
        }
      }
      if ('text' in item.value) {
        cy.get('.key-details-bar__bottom-block').contains(item.value.text)
      } else if ('html' in item.value) {
        const { html } = item.value
        cy.get('.key-details-bar__bottom-block').then($el => {
          const { actual, expected } = parseHtml($el, html)
          expect(actual).to.contain(expected)
        })
      }
    })
  }

  shouldHaveActiveTab(tabName: string): void {
    cy.get('a.moj-sub-navigation__link').contains(tabName).should('have.attr', 'aria-current', 'page')
  }

  clickTab(tabTitle: string): void {
    cy.get('.moj-sub-navigation__list').contains(tabTitle).click()
  }

  shouldHaveSelectText(id: string, text: string): void {
    cy.get(`#${id}`).find('option:selected').should('have.text', text)
  }

  shouldBeSelected(id: string): void {
    cy.get(`[value="${id}"]`).should('be.checked')
  }

  shouldNotBeSelected(id: string): void {
    cy.get(`[value="${id}"]`).should('not.be.checked')
  }

  shouldShowApplicationTimeline(timelineEvents: Array<Cas1TimelineEvent>, index: number = 0) {
    const sortedTimelineEvents = timelineEvents.sort((a, b) => {
      return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    })

    cy.get('.moj-timeline')
      .eq(index)
      .within(() => {
        cy.get('.moj-timeline__item').should('have.length', timelineEvents.length)

        cy.get('.moj-timeline__item').each(($el, i) => {
          cy.wrap($el).within(() => {
            cy.get('.moj-timeline__header').should('contain', eventTypeTranslations[sortedTimelineEvents[i].type])
            cy.get('time').should('have.attr', { time: sortedTimelineEvents[i].occurredAt })
            if (timelineEvents[i].createdBySummary?.name) {
              cy.get('.moj-timeline__header > .moj-timeline__byline').should(
                'contain',
                timelineEvents[i].triggerSource === 'system' ? 'System' : timelineEvents[i].createdBySummary.name,
              )
            }
            if (timelineEvents[i].associatedUrls?.length) {
              cy.get('.govuk-link').should('have.attr', { time: timelineEvents[i].associatedUrls[0].url })
              cy.get('.govuk-link').should('contain', timelineEvents[i].associatedUrls[0].type)
            }
            cy.get('time').should('contain', DateFormats.isoDateTimeToUIDateTime(timelineEvents[i].occurredAt))
          })
        })
      })
  }

  shouldShowPersonDetails(person: FullPerson, expectedStatus?: PersonStatus): void {
    cy.get('dl[data-cy-person-info],div[data-cy-section="person-details"]').within(() => {
      this.assertDefinition('Name', displayName(person, { laoSuffix: true }))
      this.assertDefinition('CRN', person.crn)
      this.assertDefinition('Date of Birth', DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }))
      this.assertDefinition('NOMIS Number', person.nomsNumber)
      this.assertDefinition('Nationality', person.nationality)
      this.assertDefinition('Religion or belief', person.religionOrBelief)
      this.assertDefinition('Sex', person.sex)
      cy.get(`[data-cy-status]`)
        .should('have.attr', 'data-cy-status')
        .and('equal', expectedStatus || person.status)
      this.assertDefinition('Prison', person.prisonName)
    })
  }

  shouldShowPersonHeader(person: FullPerson): void {
    const { name, crn, dateOfBirth } = person
    cy.get('.key-details-bar').should('contain', name)
    cy.get('.key-details-bar').should('contain', crn)
    cy.get('.key-details-bar').should('contain', DateFormats.isoDateToUIDate(dateOfBirth, { format: 'short' }))
  }

  shouldShowOutOfServiceBedDetails(bedDetails: OutOfServiceBed | OutOfServiceBedRevision) {
    if (bedDetails.startDate) {
      cy.get('.govuk-summary-list__key').should('contain', 'Start date')
      cy.get('.govuk-summary-list__value').should(
        'contain',
        DateFormats.isoDateToUIDate(bedDetails.startDate, { format: 'long' }),
      )
    }

    if (bedDetails.endDate) {
      cy.get('.govuk-summary-list__key').should('contain', 'End date')
      cy.get('.govuk-summary-list__value').should(
        'contain',
        DateFormats.isoDateToUIDate(bedDetails.endDate, { format: 'long' }),
      )
    }

    if (bedDetails.reason) {
      cy.get('.govuk-summary-list__key').should('contain', 'Reason')
      cy.get('.govuk-summary-list__value').should('contain', bedDetails.reason.name)
    }

    if (bedDetails.referenceNumber) {
      cy.get('.govuk-summary-list__key').should('contain', 'Reference number')
      cy.get('.govuk-summary-list__value').should('contain', bedDetails.referenceNumber)
    }

    if (bedDetails.notes) {
      cy.get('.govuk-summary-list__key').should('contain', 'Notes')
      cy.get('.govuk-summary-list__value').should('contain', bedDetails.notes)
    }
  }

  shouldShowMenuItem(label: string, visible = true): void {
    cy.get('[aria-label="Primary navigation"] a').should(visible ? 'contain' : 'not.contain', label)
  }

  clickMenuItem(label: string): void {
    cy.get('[aria-label="Primary navigation"] a').contains(label).click()
  }

  shouldShowKeyPersonDetails(placementRequest: Cas1PlacementRequestDetail) {
    cy.get('.prisoner-info').within(() => {
      const { person } = placementRequest
      if (!isFullPerson(person)) throw new Error('test requires a Full Person')

      cy.get('span').contains(displayName(person))
      cy.get('span').contains(`CRN: ${person.crn}`)
      cy.get('span').contains(`Tier: ${placementRequest?.risks?.tier?.value.level}`)
      cy.get('span').contains(`Date of birth: ${DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' })}`)
    })
  }

  shouldHaveDownloadedFile(fileName: string): void {
    const downloadsFolder = Cypress.config('downloadsFolder')
    const downloadedFilename = `${downloadsFolder}/${fileName}`
    cy.readFile(downloadedFilename, 'binary', { timeout: 300 })
  }
}
