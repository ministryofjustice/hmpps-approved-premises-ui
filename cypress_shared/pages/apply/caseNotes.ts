import { Application, PrisonCaseNote, Adjudication } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../../server/utils/dateUtils'
import { sentenceCase } from '../../../server/utils/utils'

import Page from '../page'

export default class CaseNotesPage extends Page {
  prisonCaseNotes: PrisonCaseNote[]

  constructor(application: Application, prisonCaseNotes: PrisonCaseNote[]) {
    super('Prison information')

    cy.get('label').contains(
      `Are there additional circumstances that have helped ${application.person.name} do well in the past?`,
    )
    this.prisonCaseNotes = prisonCaseNotes
  }

  shouldDisplayAdjudications(adjudications: Array<Adjudication>) {
    cy.get('a').contains('Adjudications').click()

    adjudications.forEach(adjudication => {
      cy.get('tr')
        .contains(adjudication.id)
        .parent()
        .within(() => {
          cy.get('td').eq(1).contains(DateFormats.isoDateTimeToUIDateTime(adjudication.reportedAt))
          cy.get('td').eq(2).contains(adjudication.establishment)
          cy.get('td').eq(3).contains(adjudication.offenceDescription)
          cy.get('td').eq(4).contains(sentenceCase(adjudication.finding))
        })
    })
  }

  completeForm() {
    cy.get('a').contains('Prison case notes').click()

    this.prisonCaseNotes.forEach(note => {
      cy.contains('label', `Select case note from ${DateFormats.isoDateToUIDate(note.createdAt)}`)
        .siblings('input')
        .check()
    })

    this.getTextInputByIdAndEnterDetails('moreDetail', faker.lorem.word())
  }
}
