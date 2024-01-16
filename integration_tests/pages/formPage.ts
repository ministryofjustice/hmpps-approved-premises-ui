import TasklistPage from '../../server/form-pages/tasklistPage'
import Page from './page'

export default class FormPage extends Page {
  tasklistPage: TasklistPage

  constructor(title: string, backLink?: string) {
    super(title)

    if (backLink) {
      this.checkForBackButton(backLink)
    }

    this.checkPhaseBanner('Give us your feedback')
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
}
