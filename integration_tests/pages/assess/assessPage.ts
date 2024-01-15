import { ApprovedPremisesAssessment } from '@approved-premises/api'

import Assess from '../../../server/form-pages/assess'
import TasklistPage, { TasklistPageInterface } from '../../../server/form-pages/tasklistPage'
import FormPage from '../formPage'

export default class NewAssesPage extends FormPage {
  tasklistPage: TasklistPage

  constructor(
    title: string,
    assessment: ApprovedPremisesAssessment,
    taskName: string,
    pageName: string,
    backLink?: string,
  ) {
    super(title, backLink)

    const Class = Assess.pages[taskName][pageName] as TasklistPageInterface

    this.tasklistPage = new Class(assessment.data?.[taskName]?.[pageName], assessment)
  }
}
