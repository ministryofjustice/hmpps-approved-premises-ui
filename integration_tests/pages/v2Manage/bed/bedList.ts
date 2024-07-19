import { BedDetail, BedSummary, Premises } from '../../../../server/@types/shared'

import Page from '../../page'
import paths from '../../../../server/paths/manage'

import { bedTableRows } from '../../../../server/utils/bedUtils'

export default class V2BedsListPage extends Page {
  constructor() {
    super('Manage beds')
  }

  static visit(premisesId: Premises['id']): V2BedsListPage {
    cy.visit(paths.v2Manage.premises.beds.index({ premisesId }))
    return new V2BedsListPage()
  }

  shouldShowBeds(beds: Array<BedSummary>, premisesId: Premises['id']): void {
    const rows = bedTableRows(beds, premisesId)
    this.shouldContainTableRows(rows)
  }

  clickBed(bed: BedDetail): void {
    cy.get(`a[data-cy-bedid="${bed.id}"]`).click()
  }

  clickManageOutOfServiceBeds(): void {
    cy.get('.moj-button-menu__toggle-button').click()
    cy.get('a').contains('Manage out of service beds').click()
  }
}
