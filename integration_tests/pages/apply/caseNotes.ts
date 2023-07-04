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

    this.prisonCaseNotes = prisonCaseNotes
  }

  completeForm(nomisMissing = false) {
    if (nomisMissing) {
      this.checkRadioButtonFromPageBody('informationFromPrison')
      this.completeTextInputFromPageBody('informationFromPrisonDetail')
    } else {
      cy.get('a').contains('Prison case notes').click()

      this.prisonCaseNotes.forEach(note => {
        cy.contains('label', `Select case note from ${DateFormats.isoDateToUIDate(note.createdAt)}`)
          .siblings('input')
          .check()
      })
    }
  }
}
