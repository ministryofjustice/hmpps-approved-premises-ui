import { ApprovedPremisesApplication as Application } from '../../../server/@types/shared'
import { nameOrPlaceholderCopy } from '../../../server/utils/personUtils'
import Page from '../page'

export default class EsapNotEligible extends Page {
  constructor(application: Application) {
    super(
      `${nameOrPlaceholderCopy(
        application.person,
      )} is not eligible for an Enhanced Security Approved Premises (ESAP) placement.`,
    )
  }
}
