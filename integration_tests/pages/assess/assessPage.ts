import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'

import TasklistPage from '../../../server/form-pages/tasklistPage'
import Assess from '../../../server/form-pages/assess'

import Page from '../page'

export default class AssessPage extends Page {
  pageClass: TasklistPage

  // Initialize this to ensure all the decorators are called for the Assess journey
  pages = Assess.pages

  constructor(
    public readonly assessment: Assessment,
    title: string,
  ) {
    super(title)
    this.checkPhaseBanner('Give us your feedback')
  }
}
