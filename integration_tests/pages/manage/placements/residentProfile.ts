import {
  ActiveOffence,
  Adjudication,
  ApprovedPremisesApplication,
  Cas1OASysGroup,
  Cas1SpaceBooking,
  Cas1SpaceBookingShortSummary,
  CsraSummary,
  FullPerson,
  Licence,
  Person,
  PersonAcctAlert,
  PersonRisks,
  RoshRisks,
} from '@approved-premises/api'
import { SummaryListWithCard, TextItem } from '@approved-premises/ui'
import Page from '../../page'
import paths from '../../../../server/paths/manage'
import * as residentUtils from '../../../../server/utils/resident'

import { DateFormats } from '../../../../server/utils/dateUtils'

import { licenseCards, offencesTabCards, prisonCards } from '../../../../server/utils/resident/sentenceUtils'
import { placementDetailsCards, allApPlacementsTabData } from '../../../../server/utils/resident/placementUtils'
import { contactsCardList, personDetailsCardList } from '../../../../server/utils/resident/personalUtils'
import { AND, THEN, WHEN } from '../../../helpers'
import { SubmittedDocumentRenderer } from '../../../../server/utils/forms/submittedDocumentRenderer'
import { detailedStatus } from '../../../../server/utils/placements/status'
import { ndeliusRiskCard } from '../../../../server/utils/resident/riskUtils'
import { mentalHealthCards } from '../../../../server/utils/resident/healthUtils'

export default class ResidentProfilePage extends Page {
  constructor(
    private placement: Cas1SpaceBooking,
    private personRisks: PersonRisks,
    title: string,
  ) {
    super(title)
    this.checkPhaseBanner()
  }

  static visit(placement: Cas1SpaceBooking, personRisks: PersonRisks): ResidentProfilePage {
    cy.visit(paths.resident.tabPersonal.personalDetails({ crn: placement.person.crn, placementId: placement.id }))
    return new ResidentProfilePage(placement, personRisks, 'Personal')
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

  shouldShowCard(card: SummaryListWithCard, checkContents = true) {
    const cardTitle = card.card?.title
    const title =
      cardTitle &&
      ('text' in cardTitle
        ? cardTitle.text
        : new DOMParser().parseFromString(cardTitle.html, 'text/html').body.textContent)
    if (title) cy.get('.govuk-summary-card__title').contains(title).should('exist')
    if (checkContents) {
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
      this.shouldShowBadge(`${this.personRisks.roshRisks.value.overallRisk} RoSH`)
      this.personRisks.flags.value.forEach((flag: string) => {
        this.shouldShowBadge(flag)
      })
    })
  }

  shouldShowMentalHealthSection(acctAlerts: Array<PersonAcctAlert>, riskToSelf: Cas1OASysGroup) {
    cy.stub(residentUtils, 'insetText')
    cy.stub(residentUtils, 'detailsBody')

    cy.get('.govuk-inset-text').should('contain.text', 'Imported from Digital Prison Service and OASys')

    const cards = mentalHealthCards(acctAlerts, riskToSelf).slice(1)
    cards.forEach(card => {
      this.shouldShowCard(card)
    })
  }

  shouldShowOffencesInformation(offences: Array<ActiveOffence>, oasysOffenceDetails: Cas1OASysGroup) {
    cy.get('.govuk-summary-card__title').contains('Offence').should('exist')
    const cards = offencesTabCards(offences, { ...oasysOffenceDetails, answers: [] })
    this.shouldShowCard(cards[0])
    this.shouldShowCard(cards[1])
    this.shouldShowCard(cards[2], false)
    this.shouldShowCard(cards[3], false)
    this.shouldShowCard(cards[4])
  }

  shouldShowLicenceInformation(licence: Licence) {
    cy.stub(residentUtils, 'insetText')
    const cardList = licenseCards(licence)
    cy.get('.govuk-inset-text').should('contain.text', 'Imported from Create and vary a licence service.')
    cardList.slice(1).forEach(card => {
      this.shouldShowCard(card)
    })
  }

  shouldShowPrisonInformation(adjudications: Array<Adjudication>, csraSummaries: Array<CsraSummary>, person: Person) {
    const cards = prisonCards(adjudications, csraSummaries, person)
    cards.forEach(card => this.shouldShowCard(card))
  }

  shouldShowPersonalInformation(person: Person, personRisks: PersonRisks) {
    const cards = personDetailsCardList(person as FullPerson, personRisks)
    cards.forEach(card => this.shouldShowCard(card))
  }

  shouldShowContacts(person: Person) {
    const cards = contactsCardList(person.crn)
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

  shouldShowNDeliusRiskCard(placement: Cas1SpaceBooking, personRisks: PersonRisks) {
    this.shouldShowCard(ndeliusRiskCard(placement.person.crn, personRisks))
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
