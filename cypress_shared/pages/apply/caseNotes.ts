import { ApprovedPremisesApplication, PrisonCaseNote } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import { DateFormats } from '../../../server/utils/dateUtils'

import ApplyPage from './applyPage'

export default class CaseNotesPage extends ApplyPage {
  prisonCaseNotes: Array<PrisonCaseNote>

  constructor(application: ApprovedPremisesApplication, prisonCaseNotes: Array<PrisonCaseNote>) {
    super(
      'Prison information',
      application,
      'prison-information',
      'case-notes',
      paths.applications.show({ id: application.id }),
    )

    cy.get('label').contains(
      `Are there additional circumstances that have helped ${application.person.name} do well in the past?`,
    )
    this.prisonCaseNotes = prisonCaseNotes
  }

  completeForm(moreDetail: string) {
    cy.get('a').contains('Prison case notes').click()

    this.prisonCaseNotes.forEach(note => {
      cy.contains('label', `Select case note from ${DateFormats.isoDateToUIDate(note.createdAt)}`)
        .siblings('input')
        .check()
    })

    this.getTextInputByIdAndEnterDetails('moreDetail', moreDetail)
  }
}
