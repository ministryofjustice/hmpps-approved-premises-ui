import { Cas1Premises } from '@approved-premises/api'
import Page from '../../page'
import managePaths from '../../../../server/paths/manage'
import { localRestrictionsTableRows } from '../../../../server/utils/premises'

export class LocalRestrictionsPage extends Page {
  constructor(readonly premises: Cas1Premises) {
    super('Local restrictions')

    this.shouldHaveBackLink(managePaths.premises.show({ premisesId: premises.id }))
    this.shouldShowHeadingCaption(premises.name)
  }

  shouldShowNoRestrictions(): void {
    cy.contains('This AP has no local restrictions.').should('be.visible')
  }

  shouldShowRestrictions(premises: Cas1Premises): void {
    this.shouldContainTableColumns(['Restriction', 'Date added', 'Actions'])
    this.shouldContainTableRows(localRestrictionsTableRows(premises))
  }
}
