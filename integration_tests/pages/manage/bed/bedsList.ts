import { BedDetail, BedSummary } from '../../../../server/@types/shared'

import Page from '../../page'
import paths from '../../../../server/paths/manage'

import { bedTableRows } from '../../../../server/utils/bedUtils'

export default class BedsListPage extends Page {
  constructor() {
    super('Manage beds')
  }

  static visit(premisesId: string): BedsListPage {
    cy.visit(paths.premises.beds.index({ premisesId }))
    return new BedsListPage()
  }

  shouldShowBeds(beds: Array<BedSummary>, premisesId: string): void {
    const rows = bedTableRows(beds, premisesId)
    this.shouldContainTableRows(rows)
  }

  clickBed(bed: BedDetail): void {
    cy.get(`a[data-cy-bedid="${bed.id}"]`).click()
  }
}
