import type { DataServices } from '@approved-premises/ui'

import type { Application, PrisonCaseNote } from '@approved-premises/api'

import TasklistPage from '../../tasklistPage'
import { DateFormats } from '../../../utils/dateUtils'

type CaseNotesBody = { caseNoteIds: Array<string>; selectedCaseNotes: Array<PrisonCaseNote>; moreDetail: string }

export const caseNoteCheckbox = (caseNote: PrisonCaseNote, checked: boolean) => {
  return `
  <div class="govuk-checkboxes" data-module="govuk-checkboxes">
    <div class="govuk-checkboxes__item">
      <input type="checkbox" class="govuk-checkboxes__input" name="caseNoteIds" value="${caseNote.id}" id="${
    caseNote.id
  }" ${checked ? 'checked' : ''}>
      <label class="govuk-label govuk-checkboxes__label" for="${caseNote.id}">
        <span class="govuk-visually-hidden">Select case note from ${DateFormats.isoDateToUIDate(
          caseNote.createdAt,
        )}</span>
      </label>
    </div>
  </div>
  `
}

export default class CaseNotes implements TasklistPage {
  name = 'case-notes'

  title = 'Prison information'

  questions = {
    caseNotesSelectionQuestion: 'Selected prison case notes that support this application',
    moreDetailsQuestion: `Are there additional circumstances that have helped ${this.application.person.name} do well in the past?`,
  }

  body: CaseNotesBody

  caseNotes: PrisonCaseNote[] | undefined

  constructor(body: Record<string, unknown>, private readonly application: Application) {
    const selectedCaseNotes = (body.selectedCaseNotes || []) as Array<PrisonCaseNote>
    const caseNoteIds = body.caseNoteIds ? body.caseNoteIds : selectedCaseNotes.map(n => n.id)

    this.body = {
      caseNoteIds: caseNoteIds as Array<string>,
      selectedCaseNotes,
      moreDetail: body.moreDetail as string,
    }
  }

  static async initialize(
    body: Record<string, unknown>,
    application: Application,
    token: string,
    dataServices: DataServices,
  ) {
    const caseNotes = await dataServices.personService.getPrisonCaseNotes(token, application.person.crn)

    body.caseNoteIds = body.caseNoteIds ? [body.caseNoteIds].flat() : []

    body.selectedCaseNotes = ((body.caseNoteIds || []) as Array<string>).map((noteId: string) => {
      return caseNotes.find(caseNote => caseNote.id === noteId)
    })

    const page = new CaseNotes(body, application)
    page.caseNotes = caseNotes

    return page
  }

  previous() {
    return ''
  }

  next() {
    return ''
  }

  response() {
    const response = {}

    if (this.body.selectedCaseNotes) {
      const res = this.body.selectedCaseNotes.map(caseNote => {
        return {
          'Date created': DateFormats.isoDateToUIDate(caseNote.createdAt),
          'Date occurred': DateFormats.isoDateToUIDate(caseNote.occurredAt),
          'Is the case note sensitive?': caseNote.sensitive ? 'Yes' : 'No',
          'Name of author': caseNote.authorName,
          Type: caseNote.type,
          Subtype: caseNote.subType,
          Note: caseNote.note,
        }
      })

      response[this.questions.caseNotesSelectionQuestion] = res
    }

    if (this.body.moreDetail) {
      response[this.questions.moreDetailsQuestion] = this.body.moreDetail
    }

    return response
  }

  errors() {
    const errors = {}

    return errors
  }

  checkBoxForCaseNoteId(caseNoteId: string) {
    const caseNote = this.caseNotes.find(c => c.id === caseNoteId)

    if (!caseNote) {
      throw new Error(`Case note with id ${caseNoteId} not found for CRN ${this.application.person.crn}`)
    }

    const checked = !this.body.selectedCaseNotes ? false : this.body.caseNoteIds.includes(caseNote.id)

    return caseNoteCheckbox(caseNote, checked)
  }
}
