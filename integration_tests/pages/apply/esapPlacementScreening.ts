import { ApprovedPremisesApplication } from '@approved-premises/api'
import Page from '../page'

export default class EsapPlacementScreening extends Page {
  constructor(application: ApprovedPremisesApplication) {
    super(`Why does ${application.person.name} require an enhanced security placement?`)
  }
}
