import { Cas1Premises } from '@approved-premises/api'
import managePaths from '../../../../server/paths/manage'
import Page from '../../page'

export class LocalRestrictionConfirmRemovePage extends Page {
  constructor(readonly premises: Cas1Premises) {
    super('Do you want to remove this restriction?')

    this.checkForBackButton(managePaths.premises.localRestrictions.index({ premisesId: premises.id }))
    this.shouldShowHeadingCaption(premises.name)
  }
}
