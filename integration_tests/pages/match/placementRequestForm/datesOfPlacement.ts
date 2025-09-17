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
    { dateOfPlacement: '2024-09-05', duration: { weeks: 0, days: 3 }, isFlexible: 'yes' },
  ]

  completeForm() {
    this.datesOfPlacement.forEach((dateBlock, index) => {
      this.populateBlock(index, dateBlock)
    })
  }

  populateBlock(index: number, dateBlock) {
    const parsedDate = DateFormats.isoToDateObj(dateBlock.dateOfPlacement)

    this.completeDatesOfPlacementDateInputs(parsedDate, index.toString())
    this.completeDurationInputs(index.toString(), dateBlock.duration.weeks, dateBlock.duration.days)
    this.completeIsFlexible(index.toString(), dateBlock.isFlexible)
  }

  verifyBlockPopulated(index: number, dateBlock) {
    const prefix = `datesOfPlacement_${String(index)}_arrivalDate_`

    const values = dateBlock.dateOfPlacement.split('-')
    ;['year', 'month', 'day'].forEach((part: string, i) => {
      cy.get(`#${prefix}${part}`).should('have.value', String(Number(values[i])))
    })
  }

  checkBlockTitles(blockCount: number) {
    for (let index = 0; index < blockCount; index += 1) {
      cy.get('fieldset[data-fieldset] > legend')
        .eq(index)
        .should('contain.text', `ROTL placement ${index + 1}`)
    }
  }

  removeBlock(index: number) {
    cy.get('.moj-add-another__remove-button')
      .eq(index - 1)
      .click()
  }

  addAndRemoveBlock() {
    const checkItems = (count: number) => cy.get('.moj-add-another__item').should('have.length', count)

    checkItems(2)
    this.clickButton('Add another')
    checkItems(3)
    this.removeBlock(2)
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
