import { Cas1Premises } from '@approved-premises/api'
import Page from '../../page'
import managePaths from '../../../../server/paths/manage'
import { localRestrictionsTableRows } from '../../../../server/utils/premises'
import { characteristicsBulletList } from '../../../../server/utils/characteristicsUtils'
import { spaceSearchResultsCharacteristicsLabels } from '../../../../server/utils/match/spaceSearchLabels'

export class LocalRestrictionsPage extends Page {
  constructor(private readonly premises: Cas1Premises) {
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

  shouldShowPremisesCharacteristics() {
    cy.get('.govuk-details__text').should(
      'contain.html',
      characteristicsBulletList(this.premises.characteristics, {
        labels: spaceSearchResultsCharacteristicsLabels,
      }),
    )
  }
}
