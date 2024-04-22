import {
  Adjudication,
  ApprovedPremisesApplication as Application,
  ApprovedPremisesAssessment as Assessment,
  Document,
  FullPerson,
  Person,
  PersonAcctAlert,
  PrisonCaseNote,
  SortOrder,
  TimelineEvent,
} from '../../server/@types/shared'
import { KeyDetailsArgs, PersonRisksUI, SummaryListItem, TableCell } from '../../server/@types/ui'
import errorLookups from '../../server/i18n/en/errors.json'
import { summaryListSections } from '../../server/utils/applications/summaryListUtils'
import { DateFormats } from '../../server/utils/dateUtils'
import { sentenceCase } from '../../server/utils/utils'
import { SumbmittedApplicationSummaryCards } from '../../server/utils/applications/submittedApplicationSummaryCards'
import { eventTypeTranslations } from '../../server/utils/applications/utils'

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

  completeDateInputsByName(prefix: string, date: string): void {
    const parsedDate = DateFormats.isoToDateObj(date)

    cy.get(`[name="${prefix}[day]"`).type(parsedDate.getDate().toString())
    cy.get(`[name="${prefix}[month]"`).type(`${parsedDate.getMonth() + 1}`)
    cy.get(`[name="${prefix}[year]`).type(parsedDate.getFullYear().toString())
  }

  dateInputsShouldContainDate(prefix: string, date: string): void {
    const parsedDate = DateFormats.isoToDateObj(date)
    cy.get(`#${prefix}-day`).should('have.value', parsedDate.getDate().toString())
    cy.get(`#${prefix}-month`).should('have.value', `${parsedDate.getMonth() + 1}`)
    cy.get(`#${prefix}-year`).should('have.value', parsedDate.getFullYear().toString())
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
      cy.get(`a[data-cy-documentId="${document.id}"]`).click()

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
    const sections = new SumbmittedApplicationSummaryCards(application).response

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

  searchBy(id: string, item: string): void {
    this.getSelectInputByIdAndSelectAnEntry(id, item)
  }

  clickApplyFilter(): void {
    cy.get('button').contains('Apply filters').click()
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

  shouldHaveSelectText(id: string, text: string): void {
    cy.get(`#${id}`).find('option:selected').should('have.text', text)
  }

  shouldShowApplicationTimeline(timelineEvents: Array<TimelineEvent>, index: number = 0) {
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
            if (timelineEvents[i].createdBy?.name) {
              cy.get('.moj-timeline__header > .moj-timeline__byline').should(
                'contain',
                timelineEvents[i].createdBy.name,
              )
            }
            cy.get('.govuk-link').should('have.attr', { time: timelineEvents[i].associatedUrls[0].url })
            cy.get('.govuk-link').should('contain', timelineEvents[i].associatedUrls[0].type)
            cy.get('time').should('contain', DateFormats.isoDateTimeToUIDateTime(timelineEvents[i].occurredAt))
          })
        })
      })
  }

  shouldShowPersonDetails(person: FullPerson): void {
    cy.get('dl[data-cy-person-info]').within(() => {
      this.assertDefinition('Name', person.name)
      this.assertDefinition('CRN', person.crn)
      this.assertDefinition('Date of Birth', DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }))
      this.assertDefinition('NOMIS Number', person.nomsNumber)
      this.assertDefinition('Nationality', person.nationality)
      this.assertDefinition('Religion or belief', person.religionOrBelief)
      this.assertDefinition('Sex', person.sex)
      cy.get(`[data-cy-status]`).should('have.attr', 'data-cy-status').and('equal', person.status)
      this.assertDefinition('Prison', person.prisonName)
    })
  }
}
