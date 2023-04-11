import { ApprovedPremisesApplication as Application } from '../../../server/@types/shared'
import Page from '../page'

export default class EsapNotEligible extends Page {
  constructor(application: Application) {
    super(`${application.person.name} is not eligible for an ESAP placement`)
  }
}
