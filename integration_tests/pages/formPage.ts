import TasklistPage from '../../server/form-pages/tasklistPage'
import Page from './page'

type FieldType = 'text' | 'textArea' | 'date' | 'radio'
export type FieldDetails = Record<string, { type: FieldType; error?: string; value: string; label: string }>

export default class FormPage extends Page {
  tasklistPage: TasklistPage

  fieldDetails: FieldDetails

  constructor(title: string, backLink?: string, checkPhaseBanner: boolean = true) {
    super(title)

    if (backLink) {
      this.checkForBackButton(backLink)
    }

    if (checkPhaseBanner) {
      this.checkPhaseBanner('Give us your feedback')
    }
  }

  checkRadioButtonFromPageBody(fieldName: string) {
    this.checkRadioByNameAndValue(fieldName, this.tasklistPage.body[fieldName] as string)
  }

  completeTextInputFromPageBody(fieldName: string) {
    this.getTextInputByIdAndEnterDetails(fieldName, this.tasklistPage.body[fieldName] as string)
  }

  checkCheckboxesFromPageBody(
    fieldName: string,
    options: { addArrayNotationToInputName: boolean } = { addArrayNotationToInputName: false },
  ) {
    ;(this.tasklistPage.body[fieldName] as Array<string>).forEach(need => {
      this.checkCheckboxByNameAndValue(options.addArrayNotationToInputName ? `${fieldName}[]` : fieldName, need)
    })
  }

  completeDateInputsFromPageBody(fieldName: string) {
    const date = this.tasklistPage.body[fieldName] as string
    this.completeDateInputs(fieldName, date)
  }

  selectSelectOptionFromPageBody(fieldName: string) {
    this.getSelectInputByIdAndSelectAnEntry(fieldName, this.tasklistPage.body[fieldName] as string)
  }

  shouldShowFormControls(fieldDetails?: FieldDetails) {
    Object.values(fieldDetails || this.fieldDetails).forEach(({ type, label }) => {
      if (['date', 'radio'].includes(type)) this.getLegend(label)
      else this.getLabel(label)
    })
  }

  shouldShowErrorMessages(fieldDetails?: FieldDetails) {
    Object.entries(fieldDetails || this.fieldDetails).forEach(([field, { error }]) => {
      if (error) {
        cy.get('.govuk-error-summary').should('contain', error)
        cy.get(`[data-cy-error-${field.toLowerCase()}]`).should('contain', error)
      }
    })
  }

  shouldHaveDateValue(prefix: string, date: string) {
    const values = date.split('-')
    ;['year', 'month', 'day'].forEach((part: string, index) => {
      cy.get(`#${prefix}-${part}`).should('have.value', values[index])
    })
  }

  shouldBePopulated(fieldDetails?: FieldDetails) {
    Object.entries(fieldDetails || this.fieldDetails).forEach(([field, { type, value }]) => {
      if (type === 'text') cy.get(`input[name="${field}"]`).should('have.value', value)
      if (type === 'textArea') cy.get(`textarea[name="${field}"]`).should('have.value', value)
      if (type === 'date') this.shouldHaveDateValue(field, value)
      if (type === 'radio') cy.get(`input[name="${field}"][value="${value}"]`).should('be.checked')
    })
  }

  populateForm(fieldDetails?: FieldDetails) {
    Object.entries(fieldDetails || this.fieldDetails).forEach(([field, { type, value }]) => {
      if (type === 'text') this.completeTextInput(field, value)
      if (type === 'textArea') this.completeTextArea(field, value)
      if (type === 'date') this.clearAndCompleteDateInputs(field, value)
      if (type === 'radio') this.checkRadioByNameAndValue(field, value)
    })
  }

  getFieldValueMap<T>(fieldDetails?: FieldDetails) {
    return Object.entries(fieldDetails || this.fieldDetails).reduce((out, [key, { value }]) => {
      out[key] = value
      return out as T
    }, {})
  }
}
