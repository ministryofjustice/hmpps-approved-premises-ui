import { ActiveOffence, FullPerson } from '@approved-premises/api'
import { DateFormats } from '../../../server/utils/dateUtils'
import Page from '../page'

export default class SelectOffencePage extends Page {
  constructor(
    person: FullPerson,
    private readonly offences: Array<ActiveOffence>,
  ) {
    super(`Select index offence for ${person.name}`)
  }

  shouldDisplayOffences(): void {
    this.offences.forEach((item: ActiveOffence) => {
      cy.contains(item.offenceId)
        .parent()
        .within(() => {
          cy.get('td').eq(2).contains(item.offenceDescription)
          cy.get('td').eq(3).contains(DateFormats.isoDateToUIDate(item.offenceDate))
          cy.get('td').eq(4).contains(item.convictionId)
        })
    })
  }

  selectOffence(selectedOffence: ActiveOffence): void {
    this.checkRadioByNameAndValue('offenceId', selectedOffence.offenceId)
  }
}
