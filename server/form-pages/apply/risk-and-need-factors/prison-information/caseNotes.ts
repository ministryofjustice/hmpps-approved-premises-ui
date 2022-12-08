/* eslint-disable no-underscore-dangle */
import type { DataServices } from '@approved-premises/ui'

import type { Application, PrisonCaseNote, Adjudication } from '@approved-premises/api'

import { sentenceCase } from '../../../../utils/utils'
import TasklistPage from '../../../tasklistPage'
import { DateFormats } from '../../../../utils/dateUtils'
import { Page } from '../../../utils/decorators'

type CaseNotesBody = {
  caseNoteIds: Array<string>
  selectedCaseNotes: Array<PrisonCaseNote>
  moreDetail: string
  adjudications: Array<Adjudication>
}

export const caseNoteResponse = (caseNote: PrisonCaseNote) => {
  return {
    'Date created': DateFormats.isoDateToUIDate(caseNote.createdAt),
    'Date occurred': DateFormats.isoDateToUIDate(caseNote.occurredAt),
    'Is the case note sensitive?': caseNote.sensitive ? 'Yes' : 'No',
    'Name of author': caseNote.authorName,
    Type: caseNote.type,
    Subtype: caseNote.subType,
    Note: caseNote.note,
  }
}

export const adjudicationResponse = (adjudication: Adjudication) => {
  return {
    'Adjudication number': adjudication.id,
    'Report date and time': DateFormats.isoDateTimeToUIDateTime(adjudication.reportedAt),
    Establishment: adjudication.establishment,
    'Offence description': adjudication.offenceDescription,
    Finding: sentenceCase(adjudication.finding),
  }
}

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

@Page({ name: 'case-notes', bodyProperties: ['caseNoteIds', 'selectedCaseNotes', 'moreDetail', 'adjudications'] })
export default class CaseNotes implements TasklistPage {
  title = 'Prison information'

  questions = {
    caseNotesSelectionQuestion: 'Selected prison case notes that support this application',
    moreDetailsQuestion: `Are there additional circumstances that have helped ${this.application.person.name} do well in the past?`,
  }

  caseNotes: Array<PrisonCaseNote> | undefined

  constructor(private _body: Partial<CaseNotesBody>, private readonly application: Application) {}

  public get body(): CaseNotesBody {
    return this._body as CaseNotesBody
  }

  public set body(value: CaseNotesBody) {
    const selectedCaseNotes = (value.selectedCaseNotes || []) as Array<PrisonCaseNote>
    const caseNoteIds = value.caseNoteIds ? value.caseNoteIds : selectedCaseNotes.map(n => n.id)

    this._body = {
      caseNoteIds: caseNoteIds as Array<string>,
      selectedCaseNotes,
      moreDetail: value.moreDetail as string,
      adjudications: (value.adjudications || []) as Array<Adjudication>,
    }
  }

  static async initialize(
    body: Record<string, unknown>,
    application: Application,
    token: string,
    dataServices: DataServices,
  ) {
    const caseNotes = await dataServices.personService.getPrisonCaseNotes(token, application.person.crn)
    const adjudications = await dataServices.personService.getAdjudications(token, application.person.crn)

    body.caseNoteIds = body.caseNoteIds ? [body.caseNoteIds].flat() : []
    body.adjudications = adjudications

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
    const response: Record<string, unknown> = {}

    if (this.body.selectedCaseNotes) {
      response[this.questions.caseNotesSelectionQuestion] = this.body.selectedCaseNotes.map(caseNoteResponse)
    }

    if (this.body.selectedCaseNotes) {
      response.Adjudications = this.body.adjudications.map(adjudicationResponse)
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
