import { DateFormats } from '../../../../server/utils/dateUtils'
import Page from '../../page'

export default class DatesOfPlacement extends Page {
  constructor() {
    super('Dates of placement')
  }

  inputPrefix(index: string) {
    return `datesOfPlacement[${index}]`
  }

  datesOfPlacement = [
    { dateOfPlacement: '2023-08-01', duration: { weeks: 2, days: 5 }, isFlexible: 'yes' },
    { dateOfPlacement: '2023-07-02', duration: { weeks: 1, days: 4 }, isFlexible: 'no' },
  ]

  completeForm() {
    this.datesOfPlacement.forEach((date, index) => {
      const parsedDate = DateFormats.isoToDateObj(date.dateOfPlacement)

      this.completeDatesOfPlacementDateInputs(parsedDate, index.toString())
      this.completeDurationInputs(index.toString(), date.duration.weeks, date.duration.days)
      this.completeIsFlexible(index.toString(), date.isFlexible)
    })
  }

  addAndRemoveBlock() {
    const checkItems = (count: number) =>
      cy.get('.moj-add-another__item:not(.govuk-visually-hidden)').should('have.length', count)

    checkItems(2)
    this.clickButton('Add another')
    checkItems(3)
    cy.get('.moj-add-another__item:not(.govuk-visually-hidden) button').eq(2).click()
    checkItems(2)
  }

  completeDatesOfPlacementDateInputs(date: Date, index: string): void {
    const prefix = this.inputPrefix(index)
    this.clearDateInputs(prefix)
    cy.get(`[name="${prefix}[arrivalDate-day]"`).type(date.getDate().toString())
    cy.get(`[name="${prefix}[arrivalDate-month]"`).type(`${date.getMonth() + 1}`)
    cy.get(`[name="${prefix}[arrivalDate-year]`).type(date.getFullYear().toString())
  }

  completeDurationInputs(index: string, weeks: number, days: number) {
    this.clearAndCompleteTextInputById(`datesOfPlacement_${index}_duration_weeks`, weeks.toString())
    this.clearAndCompleteTextInputById(`datesOfPlacement_${index}_duration_days`, days.toString())
  }

  completeIsFlexible(index: string, isFlexible: string) {
    this.checkRadioByNameAndValue(`datesOfPlacement[${index}][isFlexible]`, isFlexible ? 'yes' : 'no')
  }

  clearDateInputs(prefix: string): void {
    cy.get(`[name="${prefix}[arrivalDate-day]"`).clear()
    cy.get(`[name="${prefix}[arrivalDate-month]"`).clear()
    cy.get(`[name="${prefix}[arrivalDate-year]"`).clear()
  }

  clickSaveAndContinue() {
    cy.get('button').contains('Save and continue').click()
  }

  shouldShowErrors() {
    this.shouldShowErrorMessagesForFields(['datesOfPlacement_0_isFlexible'], {
      datesOfPlacement_0_isFlexible: 'State if the placement date is flexible',
    })
  }
}
