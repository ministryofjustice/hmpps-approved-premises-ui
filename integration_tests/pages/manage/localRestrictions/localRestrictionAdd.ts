import { Cas1Premises } from '@approved-premises/api'
import Page from '../../page'
import managePaths from '../../../../server/paths/manage'

export class LocalRestrictionAddPage extends Page {
  constructor(private readonly premises: Cas1Premises) {
    super('Add a local restriction')

    this.checkForBackButton(managePaths.premises.localRestrictions.index({ premisesId: premises.id }))
    this.shouldShowHeadingCaption(this.premises.name)
  }

  completeForm(description: string): void {
    this.clearInput('description')
    if (description.length) {
      this.completeTextInput('description', description)
    }
    this.clickButton('Save')
  }
}
