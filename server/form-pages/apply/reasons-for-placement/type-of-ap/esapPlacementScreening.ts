import type { ApprovedPremisesApplication } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'

import TasklistPage from '../../../tasklistPage'
import { convertKeyValuePairToCheckBoxItems, flattenCheckboxInput } from '../../../../utils/formUtils'
import { Page } from '../../../utils/decorators'
import EsapExceptionalCase from './esapExceptionalCase'
import { pageDataFromApplicationOrAssessment } from '../../../utils'

export const esapReasons = {
  secreting:
    'History of secreting items relevant to risk and re-offending in their room - requires enhanced room search through the use of body worn technology',
  cctv: 'History of engaging in behaviours which are most effectively monitored via enhanced CCTV technology - requires enhanced CCTV provision',
} as const

export const esapFactors = {
  neurodiverse: 'A diagnosis of autism or neurodiverse traits',
  complexPersonality:
    'A complex personality presentation which has created challenges in the prison and where an AP PIPE is deemed unsuitable',
  nonNsd:
    'A non-NSD case where enhanced national standards are required to manage the risks posed and thought to be beneficial to risk reduction',
  careAndSeperation: 'Individual has spent time in a Care and Separation Unit in the last 24 months',
  unlock: 'Individual has required a 2/3 prison officer unlock in the last 12 months.',
  corrupter: 'Individual has been identified as a known/suspected corrupter of staff',
}

export type EsapReasons = typeof esapReasons
export type EsapFactors = typeof esapFactors

@Page({ name: 'esap-placement-screening', bodyProperties: ['esapReasons', 'esapFactors'] })
export default class EsapPlacementScreening implements TasklistPage {
  name = 'esap-placement-screening'

  title = `Why does the person require an enhanced security placement?`

  questions = {
    esapReasons: this.title,
    esapFactors: 'Do any of the following factors also apply?',
  }

  constructor(
    public body: Partial<{ esapReasons: Array<keyof EsapReasons>; esapFactors: Array<keyof EsapFactors> }>,
    private readonly application: ApprovedPremisesApplication,
  ) {
    this.body.esapFactors = flattenCheckboxInput(body.esapFactors)
    this.body.esapReasons = flattenCheckboxInput(body.esapReasons)
  }

  previous() {
    if (Object.keys(pageDataFromApplicationOrAssessment(EsapExceptionalCase, this.application)).length) {
      return 'esap-exceptional-case'
    }
    return 'ap-type'
  }

  next() {
    if (this.body.esapReasons.includes('secreting')) {
      return 'esap-placement-secreting'
    }

    return 'esap-placement-cctv'
  }

  response() {
    return {
      [`${this.questions.esapReasons}`]: this.body.esapReasons.map(reason => esapReasons[reason]),
      [`${this.questions.esapFactors}`]: this.body.esapFactors?.map(factor => esapFactors[factor]),
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.esapReasons || !this.body.esapReasons.length) {
      errors.esapReasons = `You must specify why the person requires an enhanced security placement`
    }

    return errors
  }

  reasons() {
    return convertKeyValuePairToCheckBoxItems(esapReasons, this.body.esapReasons)
  }

  factors() {
    return convertKeyValuePairToCheckBoxItems(esapFactors, this.body.esapFactors)
  }
}
