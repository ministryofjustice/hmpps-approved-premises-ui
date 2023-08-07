import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'

import AssessPage from './assessPage'

import RequiredActions from '../../../server/form-pages/assess/assessApplication/requiredActions/requiredActions'

export default class RequiredActionsPage extends AssessPage {
  pageClass = new RequiredActions({
    additionalActions: 'yes',
    additionalActionsComments: 'Additional actions',
    curfewsOrSignIns: 'yes',
    curfewsOrSignInsComments: '',
    concernsOfUnmanagableRisk: 'yes',
    concernsOfUnmanagableRiskComments: '',
    additionalRecommendations: 'yes',
    additionalRecommendationsComments: '',
    nameOfAreaManager: 'Frank',
    'dateOfDiscussion-day': '1',
    'dateOfDiscussion-month': '2',
    'dateOfDiscussion-year': '2022',
    outlineOfDiscussion: 'Outline of discussion',
  })

  constructor(assessment: Assessment) {
    super(assessment, 'Required actions to support a placement')
  }

  completeForm() {
    this.checkRadioByNameAndValue('additionalActions', this.pageClass.body.additionalActions)
    this.clearAndCompleteTextInputById('additionalActionsComments', 'One')

    this.checkRadioByNameAndValue('curfewsOrSignIns', this.pageClass.body.curfewsOrSignIns)
    this.completeTextArea('curfewsOrSignInsComments', 'Two')

    this.checkRadioByNameAndValue('concernsOfUnmanagableRisk', this.pageClass.body.concernsOfUnmanagableRisk)
    this.clearAndCompleteTextInputById('nameOfAreaManager', this.pageClass.body.nameOfAreaManager)

    this.clearAndCompleteTextInputById('outlineOfDiscussion', this.pageClass.body.outlineOfDiscussion)

    this.completeTextArea('concernsOfUnmanagableRiskComments', 'Three')
    this.checkRadioByNameAndValue('additionalRecommendations', this.pageClass.body.additionalActions)
    this.completeTextArea('additionalRecommendationsComments', 'Four')
  }
}
