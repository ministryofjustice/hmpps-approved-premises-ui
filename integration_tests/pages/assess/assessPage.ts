import { Cas1Assessment } from '@approved-premises/api'

import Assess from '../../../server/form-pages/assess'
import TasklistPage, { TasklistPageInterface } from '../../../server/form-pages/tasklistPage'
import FormPage from '../formPage'
import { assessmentKeyDetails } from '../../../server/utils/assessments/utils'

export default class AssessPage extends FormPage {
  tasklistPage: TasklistPage

  constructor(title: string, assessment: Cas1Assessment, taskName: string, pageName: string, backLink?: string) {
    super(title, backLink, false)

    const Class = Assess.pages[taskName][pageName] as TasklistPageInterface

    this.tasklistPage = new Class(assessment.data?.[taskName]?.[pageName], assessment)
    this.shouldShowKeyDetails(assessmentKeyDetails(assessment))
    this.shouldShowMenuItem('Assess')
  }
}
