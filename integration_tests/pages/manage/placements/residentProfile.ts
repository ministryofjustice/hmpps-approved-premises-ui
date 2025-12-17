import {
  ActiveOffence,
  Adjudication,
  Cas1OASysGroup,
  Cas1SpaceBooking,
  FullPerson,
  Person,
  PersonRisks,
  RoshRisks,
} from '@approved-premises/api'
import Page from '../../page'
import paths from '../../../../server/paths/manage'

import { DateFormats } from '../../../../server/utils/dateUtils'

import { adjudicationRows, offenceSummaryList } from '../../../../server/utils/resident/sentence'
import { getResidentStatus } from '../../../../server/utils/resident'
import { personDetailsCardList } from '../../../../server/utils/resident/personal'

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

  checkHeader() {
    const person = this.placement.person as FullPerson
    const { premises, keyWorkerAllocation, expectedArrivalDate, expectedDepartureDate } = this.placement

    const arrivalDate = DateFormats.isoDateToUIDate(expectedArrivalDate, { format: 'short' })
    const departureDate = DateFormats.isoDateToUIDate(expectedDepartureDate, { format: 'short' })
    const status = getResidentStatus(this.placement)
    const duration = DateFormats.durationBetweenDates(expectedArrivalDate, expectedDepartureDate).ui

    cy.get('.profile-banner').within(() => {
      cy.get('h2').should('contain', person.name)
      this.shouldShowDescription('CRN', person.crn)
      this.shouldShowDescription('Approved Premises', premises.name)
      this.shouldShowDescription('Key worker', keyWorkerAllocation.name)
      this.shouldShowDescription('Arrival', arrivalDate)
      this.shouldShowDescription('Departure', departureDate)
      this.shouldShowDescription('Status', status)
      this.shouldShowDescription('Length of stay', duration)
      this.shouldShowBadge(`${this.personRisks.roshRisks.value.overallRisk} RoSH`)
      this.personRisks.flags.value.forEach((flag: string) => {
        this.shouldShowBadge(flag)
      })
    })
  }

  shouldShowOffencesInformation(offences: Array<ActiveOffence>, oasysOffenceDetails: Cas1OASysGroup) {
    cy.get('.govuk-summary-card__title').contains('Offence').should('exist')
    const expected = offenceSummaryList(offences, { ...oasysOffenceDetails, answers: [] })
    expected.splice(2, 1)
    expected.splice(5, 1)

    this.shouldContainSummaryListItems(expected)
  }

  shouldShowPrisonInformation(adjudications: Array<Adjudication>) {
    cy.get('.govuk-summary-card__title').contains('Prison details').should('exist')
    cy.get('.govuk-summary-card__title').contains('Cell Sharing Risk Assessment (CRSA)').should('exist')
    cy.get('.govuk-summary-card__title')
      .contains('Adjudications')
      .parents('.govuk-summary-card')
      .within(() => {
        this.shouldContainTableColumns(['Date created', 'Description', 'Outcome', 'Sanction'])
        this.shouldContainTableRows(adjudicationRows(adjudications))
      })
  }

  shouldShowPersonalInformation(person: Person, personRisks: PersonRisks, placement: Cas1SpaceBooking) {
    const cards = personDetailsCardList(person as FullPerson, personRisks, placement)
    cards.forEach(card => {
      cy.get('.govuk-summary-card__title')
        .contains(card.card.title.text)
        .parents('.govuk-summary-card')
        .within(() => {
          this.shouldContainSummaryListItems(card.rows)
        })
    })
  }

  shouldShowCards(numbers: Array<string>, group: Cas1OASysGroup, groupName: string) {
    numbers.forEach(questionNumber => {
      const blockTitle = `${questionNumber} ${groupName}`
      const question = group.answers.find(({ questionNumber: qnumber }) => qnumber === questionNumber)
      cy.contains(blockTitle).parents('.govuk-summary-card').contains(question.label)
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
}
