import { Application, PrisonCaseNote } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../../server/utils/dateUtils'

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

  completeForm() {
    this.prisonCaseNotes.forEach(note => {
      cy.contains('label', `Select case note from ${DateFormats.isoDateToUIDate(note.createdAt)}`)
        .siblings('input')
        .check()
    })

    this.getTextInputByIdAndEnterDetails('moreDetail', faker.lorem.word())
  }
}
