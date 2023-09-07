import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import type { ApprovedPremisesApplication } from '@approved-premises/api'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { yesOrNoResponseWithDetailForNo } from '../../../utils'
import { retrieveQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import Rfap from './rfap'

export const questionKeys = ['catering'] as const

type QuestionKeys = (typeof questionKeys)[number]
@Page({ name: 'catering', bodyProperties: ['catering', 'cateringDetail'] })
export default class Catering implements TasklistPage {
  title = 'Catering requirements'

  questionPredicates = {
    catering: 'be placed in a self-catered Approved Premises (AP)',
  }

  questions = {
    catering: `Can the person ${this.questionPredicates.catering}?`,
  }

  constructor(
    public body: Partial<YesOrNoWithDetail<'catering'>>,
    private readonly application: ApprovedPremisesApplication,
  ) {}

  previous() {
    const rfapResponse = retrieveQuestionResponseFromFormArtifact(this.application, Rfap, 'needARfap')
    if (rfapResponse === 'no') {
      return 'rfap'
    }
    return 'rfap-details'
  }

  next() {
    return 'arson'
  }

  response() {
    return {
      [this.questions.catering]: yesOrNoResponseWithDetailForNo<QuestionKeys>('catering', this.body),
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.catering) {
      errors.catering = `You must specify if the person can ${this.questionPredicates.catering}`
    }

    if (this.body.catering === 'no' && !this.body.cateringDetail) {
      errors.cateringDetail = `You must specify details if you have any concerns about the person catering for themselves`
    }

    return errors
  }
}
