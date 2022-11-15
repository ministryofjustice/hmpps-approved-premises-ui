import Page from '../page'
import TasklistPage from '../../../server/form-pages/tasklistPage'
import { Application } from '../../../server/@types/shared/models/Application'

import { pages } from '../../../server/form-pages/apply'

export default class ApplyPage extends Page {
  tasklistPage: TasklistPage

  constructor(title: string, application: Application, taskName: string, pageName: string) {
    super(title)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Class = pages[taskName][pageName] as any

    this.tasklistPage = new Class(application.data?.[taskName]?.[pageName], application)
  }

  checkRadioButtonFromPageBody(fieldName: string) {
    this.checkRadioByNameAndValue(fieldName, this.tasklistPage.body[fieldName] as string)
  }

  completeTextInputFromPageBody(fieldName: string) {
    this.getTextInputByIdAndEnterDetails(fieldName, this.tasklistPage.body[fieldName] as string)
  }

  checkCheckboxesFromPageBody(fieldName: string) {
    ;(this.tasklistPage.body[fieldName] as Array<string>).forEach(need => {
      this.checkCheckboxByNameAndValue(fieldName, need)
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
