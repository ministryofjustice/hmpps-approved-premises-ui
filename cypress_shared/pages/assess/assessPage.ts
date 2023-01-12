import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'

import TasklistPage from '../../../server/form-pages/tasklistPage'
import Assess from '../../../server/form-pages/assess'

import Page from '../page'

export default class AssessPage extends Page {
  pageClass: TasklistPage

  constructor(private readonly assessment: Assessment, title: string) {
    super(title)
  }
}
