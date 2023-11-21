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
    { dateOfPlacement: '2023-08-01', duration: { days: 5, weeks: 2 } },
    { dateOfPlacement: '2023-07-02', duration: { days: 4, weeks: 1 } },
  ]

  completeForm() {
    this.datesOfPlacement.forEach((date, index) => {
      const parsedDate = DateFormats.isoToDateObj(date.dateOfPlacement)

      this.completeDatesOfPlacementDateInputs(parsedDate, index.toString())
      this.completeDurationInputs(index.toString(), date.duration.weeks, date.duration.days)
    })
  }

  clickAddAnother() {
    cy.get('button').contains('Add another').click()
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

  clearDateInputs(prefix: string): void {
    cy.get(`[name="${prefix}[arrivalDate-day]"`).clear()
    cy.get(`[name="${prefix}[arrivalDate-month]"`).clear()
    cy.get(`[name="${prefix}[arrivalDate-year]"`).clear()
  }

  clickSaveAndContinue() {
    cy.get('button').contains('Save and continue').click()
  }
}
