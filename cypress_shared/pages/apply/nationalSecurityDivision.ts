import { YesOrNo } from '@approved-premises/ui'
import { ApprovedPremisesApplication } from '../../../server/@types/shared/models/ApprovedPremisesApplication'
import Page from '../page'

export default class NationalSecurityDivision extends Page {
  constructor(application: ApprovedPremisesApplication) {
    super(`Is ${application.person.name} managed by the National Security Division?`)
  }

  completeForm(answer: YesOrNo) {
    this.checkRadioByNameAndValue('managedByNationalSecurityDivision', answer)
  }
}
