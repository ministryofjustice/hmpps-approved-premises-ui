import { Cas1Premises, Cas1PremisesLocalRestrictionSummary } from '@approved-premises/api'
import Page from '../../page'
import { DateFormats } from '../../../../server/utils/dateUtils'
import managePaths from '../../../../server/paths/manage'

export class LocalRestrictionsPage extends Page {
  constructor(private readonly premises: Cas1Premises) {
    super('Local restrictions')

    this.shouldShowHeadingCaption(this.premises.name)
  }

  shouldShowNoRestrictions(): void {
    cy.contains('This AP has no local restrictions.').should('be.visible')
  }

  shouldShowRestrictions(restrictions: Array<Cas1PremisesLocalRestrictionSummary>): void {
    this.shouldContainTableColumns(['Restriction', 'Date added', 'Actions'])
    this.shouldContainTableRows(
      restrictions.map(restriction => [
        { text: restriction.description },
        { text: DateFormats.isoDateToUIDate(restriction.createdAt, { format: 'short' }) },
        {
          html: `<a href="${managePaths.premises.localRestrictions.remove({
            premisesId: this.premises.id,
            id: restriction.id,
          })}">Remove</a>`,
        },
      ]),
    )
  }
}
