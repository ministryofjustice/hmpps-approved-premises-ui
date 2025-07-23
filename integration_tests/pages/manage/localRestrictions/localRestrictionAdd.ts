import { Cas1Premises } from '@approved-premises/api'
import Page from '../../page'
import managePaths from '../../../../server/paths/manage'

export class LocalRestrictionAddPage extends Page {
  constructor(private readonly premises: Cas1Premises) {
    super('Add a local restriction')

    this.shouldHaveBackLink(managePaths.premises.localRestrictions.index({ premisesId: premises.id }))
    this.shouldShowHeadingCaption(this.premises.name)
  }

  completeForm(restrictionText: string): void {
    this.clearInput('restriction')
    this.completeTextInput('restriction', restrictionText)
    this.clickButton('Save')
  }
}
