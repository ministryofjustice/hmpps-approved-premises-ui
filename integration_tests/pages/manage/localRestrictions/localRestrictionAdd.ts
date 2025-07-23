import { Cas1Premises } from '@approved-premises/api'
import Page from '../../page'

export class LocalRestrictionAddPage extends Page {
  constructor(private readonly premises: Cas1Premises) {
    super('Add a local restriction')

    this.shouldShowHeadingCaption(this.premises.name)
  }

  completeForm(restrictionText: string): void {
    this.clearInput('restriction')
    this.completeTextInput('restriction', restrictionText)
    this.clickButton('Save')
  }
}
