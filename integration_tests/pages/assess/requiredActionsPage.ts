import { faker } from '@faker-js/faker/locale/en_GB'
import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'

import AssessPage from './assessPage'

import RequiredActions from '../../../server/form-pages/assess/assessApplication/requiredActions/requiredActions'

export default class RequiredActionsPage extends AssessPage {
  pageClass = new RequiredActions({
    additionalActions: 'yes',
    additionalActionsComments: '',
    curfewsOrSignIns: 'yes',
    curfewsOrSignInsComments: '',
    concernsOfUnmanagableRisk: 'yes',
    concernsOfUnmanagableRiskComments: '',
    additionalRecommendations: 'yes',
    additionalRecommendationsComments: '',
    nameOfAreaManager: faker.person.fullName(),
    'dateOfDiscussion-day': '1',
    'dateOfDiscussion-month': '2',
    'dateOfDiscussion-year': '2022',
    outlineOfDiscussion: '',
  })

  constructor(assessment: Assessment) {
    super(assessment, 'Required actions to support a placement')
  }

  completeForm() {
    this.checkRadioByNameAndValue('additionalActions', this.pageClass.body.additionalActions)
    this.completeTextArea('additionalActionsComments', 'One')

    this.checkRadioByNameAndValue('curfewsOrSignIns', this.pageClass.body.curfewsOrSignIns)
    this.completeTextArea('curfewsOrSignInsComments', 'Two')

    this.checkRadioByNameAndValue('concernsOfUnmanagableRisk', this.pageClass.body.concernsOfUnmanagableRisk)
    this.getTextInputByIdAndEnterDetails('nameOfAreaManager', 'Frank')

    this.completeTextArea('outlineOfDiscussion', 'foo bar baz')

    this.completeTextArea('concernsOfUnmanagableRiskComments', 'Three')
    this.checkRadioByNameAndValue('additionalRecommendations', this.pageClass.body.additionalActions)
    this.completeTextArea('additionalRecommendationsComments', 'Four')
  }
}
