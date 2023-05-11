import Page from '../page'
import paths from '../../../server/paths/manage'
import { Bed } from '../../../server/@types/shared'
import { sentenceCase } from '../../../server/utils/utils'

export default class RoomsShowPage extends Page {
  constructor() {
    super('Manage room')
  }

  static visit(premisesId: string, roomId: string): RoomsShowPage {
    cy.visit(paths.premises.room({ premisesId, roomId }))
    return new RoomsShowPage()
  }

  shouldShowBeds(beds: Array<Bed>): void {
    beds.forEach(item => {
      cy.contains(item.name)
    })
  }

  shouldShowCharacteristics(characteristics: Array<{ name: string }>): void {
    characteristics.forEach(item => {
      cy.get('li').contains(sentenceCase(item.name))
    })
  }

  clickBookBedLink(bedName: string): void {
    cy.contains(bedName).siblings().contains('Book bed').click()
  }

  clickMarkBedOutOfServiceLink(bedName: string): void {
    cy.contains(bedName).siblings().contains('Mark bed as out of service').click()
  }
}
