import {
  Adjudication,
  ApprovedPremisesApplication,
  BookingDetails,
  Cas1OASysGroup,
  Cas1SpaceBooking,
  Cas1SpaceBookingShortSummary,
  CaseDetail,
  CsraSummary,
  DietAndAllergyResponse,
  FullPerson,
  Licence,
  Person,
  PersonAcctAlert,
  PersonRisks,
  PrisonCaseNote,
  RoshRisks,
} from '@approved-premises/api'
import { SummaryListWithCard, TextItem } from '@approved-premises/ui'
import { faker } from '@faker-js/faker'
import Page, { parseHtml } from '../../page'
import paths from '../../../../server/paths/manage'
import * as residentUtils from '../../../../server/utils/resident'
import { dietCard, mentalHealthCards, smokerCard } from '../../../../server/utils/resident/healthUtils'

import { DateFormats } from '../../../../server/utils/dateUtils'

import { licenseCards, offencesTabCards, prisonCards } from '../../../../server/utils/resident/sentenceUtils'
import { placementDetailsCards, allApPlacementsTabData } from '../../../../server/utils/resident/placementUtils'
import { contactsCardList, personDetailsCardList } from '../../../../server/utils/resident/personalUtils'
import { AND, THEN, WHEN } from '../../../helpers'
import { SubmittedDocumentRenderer } from '../../../../server/utils/forms/submittedDocumentRenderer'
import { detailedStatus } from '../../../../server/utils/placements/status'

export default class ResidentProfilePage extends Page {
  constructor(
    private placement: Cas1SpaceBooking,
    private caseDetail: CaseDetail,
    title: string,
  ) {
    super(title)
    this.checkPhaseBanner()
  }

  static visit(placement: Cas1SpaceBooking, caseDetail: CaseDetail): ResidentProfilePage {
    cy.visit(paths.resident.tabPersonal.personalDetails({ crn: placement.person.crn, placementId: placement.id }))
    return new ResidentProfilePage(placement, caseDetail, 'Personal')
  }

  static visitUnauthorised(placement: Cas1SpaceBooking): ResidentProfilePage {
    cy.visit(paths.resident.tabPersonal.personalDetails({ crn: placement.person.crn, placementId: placement.id }), {
      failOnStatusCode: false,
    })
    return new ResidentProfilePage(undefined, undefined, `Authorisation Error`)
  }

  static visitCrnMismatch(urlCrn: string, placement: Cas1SpaceBooking): void {
    cy.visit(paths.resident.tabPersonal.personalDetails({ crn: urlCrn, placementId: placement.id }), {
      failOnStatusCode: false,
    })

    cy.get('h1').contains("The CRN in the URL doesn't match the CRN in the placement")
  }

  static visitRestrictedPerson(placement: Cas1SpaceBooking) {
    cy.visit(paths.resident.tabPersonal.personalDetails({ crn: placement.person.crn, placementId: placement.id }), {
      failOnStatusCode: false,
    })
    cy.get('h1').should('contain.text', `CRN: ${placement.person.crn} is restricted`)
  }

  shouldShowCards(cards: Array<SummaryListWithCard>) {
    cy.get('.govuk-summary-card').should('have.length', cards.length)
    cards.forEach(card => this.shouldShowCard(card))
  }

  shouldShowCard(card: SummaryListWithCard) {
    const cardTitle = card.card?.title
    const title =
      cardTitle &&
      ('text' in cardTitle
        ? cardTitle.text
        : new DOMParser().parseFromString(cardTitle.html, 'text/html').body.textContent)
    cy.log('*****  Checking card:', title)
    if (title?.length) {
      cy.get('.govuk-summary-card__title').contains(title).should('exist')
      cy.get('.govuk-summary-card__title')
        .contains(title)
        .parents('.govuk-summary-card')
        .within(() => {
          if (card.rows) {
            this.shouldContainSummaryListItems(card.rows)
          }
          if (card.table) {
            cy.get('table:not(.text-table)').within(() => {
              this.shouldContainTableColumns(card.table.head.map(cell => (cell as TextItem).text))
              this.shouldContainOrderedTableRows(card.table.rows)
            })
          }
          if (card.html) {
            cy.get('.govuk-summary-card__content').then($el => {
              const { actual, expected } = parseHtml($el, card.html)
              expect(actual).to.contain(expected)
            })
          }
        })
    }
  }

  checkHeader() {
    const person = this.placement.person as FullPerson
    const { premises, expectedArrivalDate, expectedDepartureDate } = this.placement

    const arrivalDate = DateFormats.isoDateToUIDate(expectedArrivalDate, { format: 'short' })
    const departureDate = DateFormats.isoDateToUIDate(expectedDepartureDate, { format: 'short' })
    const duration = DateFormats.durationBetweenDates(expectedArrivalDate, expectedDepartureDate).ui
    const statusKey = detailedStatus(this.placement)

    cy.get('.profile-banner').within(() => {
      cy.get('h2').should('contain', person.name)
      cy.get(`[data-cy-status="${statusKey}"]`).should('exist')
      this.shouldShowDescription('CRN', person.crn)
      this.shouldShowDescription('AP', premises.name)
      this.shouldShowDescription('Arrival', arrivalDate)
      this.shouldShowDescription('Departure', departureDate)
      this.shouldShowDescription('Length of stay', duration)
      this.caseDetail.registrations.forEach(registration => {
        this.shouldShowBadge(registration.description)
      })
      this.shouldShowBadge(
        `MAPPA CAT ${this.caseDetail.mappaDetail.category} LEVEL ${this.caseDetail.mappaDetail.level}`,
      )
    })
  }

  shouldShowMentalHealthSection(
    personAcctAlerts: Array<PersonAcctAlert>,
    riskToSelf: Cas1OASysGroup,
    supportingInformation: Cas1OASysGroup,
  ) {
    cy.stub(residentUtils, 'insetText').returns('')
    cy.stub(residentUtils, 'detailsBody').returns('')

    cy.get('.govuk-inset-text').should('contain.text', 'Imported from Digital Prison Service and OASys')

    const cards = mentalHealthCards({
      personAcctAlerts,
      riskToSelf,
      supportingInformation,
      personAcctAlertsOutcome: 'success',
      riskToSelfOutcome: 'success',
      supportingInformationOutcome: 'success',
    }).slice(1)
    cards.forEach(card => {
      this.shouldShowCard(card)
    })
  }

  shouldShowDietAndAllergyCard(dietAndAllergyResponse: DietAndAllergyResponse) {
    this.shouldShowCard(dietCard(dietAndAllergyResponse, 'success'))
  }

  shouldShowSmokingStatus(bookingDetails: BookingDetails) {
    this.shouldShowCard(smokerCard(bookingDetails, 'success'))
  }

  shouldShowApplicationLink(placement: Cas1SpaceBooking) {
    const applicationPageLink = paths.resident.tabPlacement.application({
      crn: placement.person.crn,
      placementId: placement.id,
    })

    cy.get('.govuk-inset-text a')
      .should('have.text', 'application and assessment page')
      .should('have.attr', 'href', applicationPageLink)
  }

  shouldShowOffencesInformation(caseDetail: CaseDetail, oasysOffenceDetails: Cas1OASysGroup) {
    cy.stub(residentUtils, 'detailsBody').returns('')
    cy.get('.govuk-summary-card__title').contains('Offence').should('exist')
    const cards = offencesTabCards({
      caseDetail,
      oasysAnswers: oasysOffenceDetails,
      caseDetailOutcome: 'success',
      oasysOutcome: 'success',
    })
    this.shouldShowCards(cards)
  }

  shouldShowLicenceInformation(licence: Licence) {
    cy.stub(residentUtils, 'insetText').returns('')
    const cardList = licenseCards(licence, 'success')
    cy.get('.govuk-inset-text').should('contain.text', 'Imported from Create and vary a licence service.')
    cardList.slice(1).forEach(card => {
      this.shouldShowCard(card)
    })
  }

  shouldShowPrisonInformation(
    adjudications: Array<Adjudication>,
    csraSummaries: Array<CsraSummary>,
    person: Person,
    caseNotes: Array<PrisonCaseNote>,
  ) {
    const cards = prisonCards({
      adjudications,
      csraSummaries,
      person,
      caseNotes,
      adjudicationResult: 'success',
      csraResult: 'success',
      personResult: 'success',
      caseNotesResult: 'success',
    })
    cards.forEach(card => this.shouldShowCard(card))
  }

  shouldShowPersonalInformation(person: Person, personRisks: PersonRisks) {
    cy.stub(residentUtils, 'insetText').returns('inset text')
    const cards = personDetailsCardList(person as FullPerson, personRisks)
    cards.forEach(card => this.shouldShowCard(card))
  }

  shouldShowContacts(caseDetail: CaseDetail) {
    cy.contains('Imported from NDelius')
    const cards = contactsCardList(caseDetail, 'success', 'crn')
    cards.forEach(card => this.shouldShowCard(card))
  }

  shouldShowOasysCards(numbers: Array<string>, group: Cas1OASysGroup, groupName: string) {
    numbers.forEach(questionNumber => {
      const blockTitle = `${questionNumber} ${groupName}`
      const question = group.answers.find(({ questionNumber: qnumber }) => qnumber === questionNumber)
      cy.contains(blockTitle).parents('.govuk-summary-card').contains(question.label)
    })
  }

  shouldShowPlacementDetails() {
    const expected = placementDetailsCards(this.placement)

    expected.forEach(summaryListWithCard => {
      const { card, rows } = summaryListWithCard
      const { title: cardTitle } = card
      const title = 'text' in cardTitle ? cardTitle.text : cardTitle.html?.split('<')[0].trim()

      cy.get('.govuk-summary-card')
        .contains('h2', title)
        .parents('.govuk-summary-card')
        .within(() => {
          this.shouldContainSummaryListItems(rows)
        })
    })
  }

  shouldShowNDeliusRiskCard() {
    cy.stub(residentUtils, 'ndeliusDeeplink').returns('gizmo')
    cy.contains('NDelius risk flags (registers)')
  }

  shouldShowNDeliusRiskFlagsTable(
    registrations: Array<{
      description: string
      riskNotesDetail: Array<{ note: string }>
      riskFlagGroupDescription?: string
    }>,
  ) {
    cy.contains('h2', 'NDelius risk flags (registers)').should('be.visible')

    cy.contains('h2.govuk-summary-card__title', 'NDelius risk flags')
      .closest('.govuk-summary-card')
      .within(() => {
        cy.get('table:not(.text-table):not(.rosh-widget__table)').within(() => {
          cy.get('thead th').eq(0).should('contain.text', 'Flag')
          cy.get('thead th').eq(1).should('contain.text', 'Notes')

          registrations.forEach((registration, index) => {
            cy.get('tbody tr')
              .eq(index)
              .within(() => {
                cy.get('td').eq(0).should('contain.text', registration.description)
                cy.get('td').eq(0).should('contain.text', registration.riskFlagGroupDescription)
                cy.get('td').eq(1).should('contain.text', registration.riskNotesDetail[0].note)
              })
          })
        })
      })
  }

  shouldShowRoshWidget(risks: RoshRisks) {
    const mapText = (text: string) => (text === 'Very High' ? 'Very high' : text)

    cy.get('.rosh-widget').within(() => {
      cy.contains(`Last updated: ${DateFormats.isoDateToUIDate(risks.lastUpdated)}`)
      this.shouldContainTableRows([
        [{ text: 'Children' }, { text: mapText(risks.riskToChildren) }],
        [{ text: 'Public' }, { text: mapText(risks.riskToPublic) }],
        [{ text: 'Known adult' }, { text: mapText(risks.riskToKnownAdult) }],
        [{ text: 'Staff' }, { text: mapText(risks.riskToStaff) }],
      ])
    })
  }

  shouldShowPlacementRiskWidget(placement: Cas1SpaceBooking, caseDetail: CaseDetail) {
    const riskToStaffSummary = faker.lorem.paragraph()
    const riskToResidentsSummary = faker.lorem.paragraph()

    const profileData = {
      'risk-information': {
        'risk-to-staff': { riskToStaffSummary },
        'risk-to-residents': { riskToResidentsSummary },
      },
      preArrivalTasksComplete: true,
    }
    AND('the widget should show its unpopulated state')
    cy.get('.govuk-summary-card__content').should(
      'contain.text',
      'This information will be available when the pre-arrival tasks are complete.',
    )

    WHEN('the profile data are populated')
    cy.task('stubFormDataGet', { placement, journey: 'profile', data: profileData })
    cy.reload()

    cy.get('.govuk-summary-card').within(() => {
      THEN('I should see the correct content in the widget')
      cy.get('.govuk-summary-list__row').eq(0).should('contain.text', riskToStaffSummary)
      cy.get('.govuk-summary-list__row').eq(1).should('contain.text', riskToResidentsSummary)

      WHEN('I click the change link')
      this.clickLink('Change')
    })

    THEN('I am on the Risk to staff edit page')
    cy.get('h1').contains('Risk to staff')
    cy.get('textarea').should('contain.text', riskToStaffSummary)

    WHEN('I continue I am on the risk to residents page')
    this.clickButton('Save and continue')
    cy.get('h1').contains('Risk to other residents')
    cy.get('textarea').should('contain.text', riskToResidentsSummary)

    WHEN('I edit the text and click continue')
    this.completeTextArea('riskToResidentsSummary', 'Edited')
    this.clickButton('Save and continue')
    cy.task('stubFormDataFromLastUpdate', { placement, journey: 'profile' })

    AND('I return to the placement risks tab')
    ResidentProfilePage.visit(placement, caseDetail)
    this.clickTab('Risk')
    this.clickSideNav('Placement risks')

    cy.get('.govuk-summary-card').within(() => {
      THEN('I see that the staff risks have been edited')
      cy.get('.govuk-summary-list__row').eq(0).should('contain.text', riskToStaffSummary)
      cy.get('.govuk-summary-list__row').eq(1).should('contain.text', 'Edited')

      AND('The last updated date has been updated')
      cy.get('.govuk-hint')
        .should('contain.text', `Last updated on`)
        .should(
          'contain.text',
          DateFormats.isoDateTimeToUIDateTime(new Date().toISOString(), { formatStr: "iiii d MMM y 'at'" }),
        )
    })
  }

  shouldShowAllApPlacements(spaceBookings: Array<Cas1SpaceBookingShortSummary>) {
    const cardList = allApPlacementsTabData(spaceBookings)

    cy.contains('h2', 'All AP placements').should('be.visible')

    cardList.forEach(card => {
      this.shouldShowCard(card)
    })
  }

  shouldShowApplication(application: ApprovedPremisesApplication) {
    const person = application.person as FullPerson
    const sections = new SubmittedDocumentRenderer(application).response

    AND('I should see a warning banner')
    this.shouldShowAlert('This application may not show the latest resident information')

    WHEN('I expand all the sections')
    this.clickButton('Show all sections')

    THEN('I should see the personal details card')
    cy.get('.govuk-summary-card__title')
      .contains('Person Details')
      .parents('.govuk-summary-card')
      .within(() => {
        this.shouldContainSummaryListItems([
          { key: { text: 'Name' }, value: { text: person.name } },
          { key: { text: 'CRN' }, value: { text: person.crn } },
          { key: { text: 'Date of Birth' }, value: { text: DateFormats.isoDateToUIDate(person.dateOfBirth) } },
        ])
      })
    AND('I should see all the section cards')
    sections.forEach(section => {
      cy.get('.govuk-accordion__section-heading')
        .contains(section.title)
        .parents('.govuk-accordion__section')
        .within(() => {
          section.tasks.forEach(task => {
            this.shouldShowCard(task as never as SummaryListWithCard)
          })
        })
    })
  }

  shouldHaveCorrectReturnPath(placement: Cas1SpaceBooking) {
    this.shouldHaveBackLink(
      paths.resident.tabPlacement.placementDetails({ crn: placement.person.crn, placementId: placement.id }),
    )
    this.clickBack()
  }
}
