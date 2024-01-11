import { ApprovedPremisesApplication } from '@approved-premises/api'

import Apply from '../../../server/form-pages/apply'
import TasklistPage, { TasklistPageInterface } from '../../../server/form-pages/tasklistPage'
import FormPage from '../formPage'

export default class ApplyPage extends FormPage {
  tasklistPage: TasklistPage

  constructor(
    title: string,
    application: ApprovedPremisesApplication,
    taskName: string,
    pageName: string,
    backLink?: string,
  ) {
    super(title, backLink)

    const Class = Apply.pages[taskName][pageName] as TasklistPageInterface

    this.tasklistPage = new Class(application.data?.[taskName]?.[pageName], application)
  }
}
