import type { DataServices, PageResponse, TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'

import type { Adjudication, ApprovedPremisesApplication, PersonAcctAlert, PrisonCaseNote } from '@approved-premises/api'

import { yesOrNoResponseWithDetailForYes } from '../../../utils'
import { sentenceCase } from '../../../../utils/utils'
import TasklistPage from '../../../tasklistPage'
import { DateFormats, uiDateOrDateEmptyMessage } from '../../../../utils/dateUtils'
import { Page } from '../../../utils/decorators'

type CaseNotesAdjudication = Omit<Adjudication, 'finding'> & {
  /** @nullable */
  finding?: string | null
}

type CaseNotesBody = {
  caseNoteIds: Array<string>
  selectedCaseNotes: Array<PrisonCaseNote>
  adjudications: Array<Adjudication>
  acctAlerts: Array<PersonAcctAlert>
} & YesOrNoWithDetail<'informationFromPrison'>

export const caseNoteResponse = (caseNote: PrisonCaseNote) => {
  return {
    'Date created': uiDateOrDateEmptyMessage(caseNote, 'createdAt', DateFormats.isoDateToUIDate),
    'Date occurred': uiDateOrDateEmptyMessage(caseNote, 'occurredAt', DateFormats.isoDateToUIDate),
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
    'Report date and time': uiDateOrDateEmptyMessage(adjudication, 'reportedAt', DateFormats.isoDateTimeToUIDateTime),
    Establishment: adjudication.establishment,
    'Offence description': adjudication.offenceDescription,
    Finding: sentenceCase(adjudication.finding),
  }
}

export const acctAlertResponse = (acctAlert: PersonAcctAlert) => {
  return {
    'Alert type': acctAlert.alertId,
    'ACCT description': acctAlert.comment ?? '',
    'Date created': uiDateOrDateEmptyMessage(acctAlert, 'dateCreated', DateFormats.isoDateToUIDate),
    'Expiry date': uiDateOrDateEmptyMessage(acctAlert, 'dateExpires', DateFormats.isoDateToUIDate),
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
        <span class="govuk-visually-hidden">Select case note from ${uiDateOrDateEmptyMessage(
          caseNote,
          'createdAt',
          DateFormats.isoDateToUIDate,
        )}</span>
      </label>
    </div>
  </div>
  `
}

@Page({
  name: 'case-notes',
  bodyProperties: [
    'caseNoteIds',
    'selectedCaseNotes',
    'adjudications',
    'acctAlerts',
    'informationFromPrison',
    'informationFromPrisonDetail',
  ],
})
export default class CaseNotes implements TasklistPage {
  title = 'Prison information'

  questions = {
    caseNotesSelectionQuestion: 'Selected prison case notes that support this application',
  }

  caseNotes: Array<PrisonCaseNote> | undefined

  nomisFailed: boolean

  constructor(
    private _body: Partial<CaseNotesBody>,
    private readonly application: ApprovedPremisesApplication,
  ) {}

  public get body(): CaseNotesBody {
    return this._body as CaseNotesBody
  }

  public set body(value: CaseNotesBody) {
    const selectedCaseNotes = (value.selectedCaseNotes || []) as Array<PrisonCaseNote>
    const caseNoteIds = value.caseNoteIds ? value.caseNoteIds : selectedCaseNotes.map(n => n.id)

    this._body = {
      caseNoteIds: caseNoteIds as Array<string>,
      selectedCaseNotes,
      adjudications: (value.adjudications || []) as Array<CaseNotesAdjudication>,
      acctAlerts: (value.acctAlerts || []) as Array<PersonAcctAlert>,
      informationFromPrison: value.informationFromPrison,
      informationFromPrisonDetail: value.informationFromPrisonDetail,
    }
  }

  static async initialize(
    body: Record<string, unknown>,
    application: ApprovedPremisesApplication,
    token: string,
    dataServices: DataServices,
  ) {
    const page = new CaseNotes(body, application)

    try {
      const caseNotes = await dataServices.personService.getPrisonCaseNotes(token, application.person.crn)
      const adjudications = await dataServices.personService.getAdjudications(token, application.person.crn)
      const acctAlerts = await dataServices.personService.getAcctAlerts(token, application.person.crn)

      page.body.caseNoteIds = (body.caseNoteIds ? [body.caseNoteIds].flat() : []) as Array<string>
      page.body.adjudications = adjudications
      page.body.acctAlerts = acctAlerts

      page.body.selectedCaseNotes = page.body.caseNoteIds.map((noteId: string) => {
        return caseNotes.find(caseNote => caseNote.id === noteId)
      })

      page.caseNotes = caseNotes
      page.nomisFailed = false
    } catch (e) {
      if (e?.data?.status === 404) {
        page.nomisFailed = true
      } else {
        throw e
      }
    }

    return page
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return ''
  }

  response() {
    const response: PageResponse = {}

    if (this.body.selectedCaseNotes.length) {
      response[this.questions.caseNotesSelectionQuestion] = this.body.selectedCaseNotes.map(caseNoteResponse)
    }

    if (this.body.adjudications.length) {
      response.Adjudications = this.body.adjudications.map(adjudicationResponse)
    }

    if (this.body.acctAlerts.length) {
      response['ACCT Alerts'] = this.body.acctAlerts.map(acctAlertResponse)
    }

    if (this.body.informationFromPrison) {
      response["Do you have any information from prison that will help with the person's risk management?"] =
        yesOrNoResponseWithDetailForYes('informationFromPrison', this.body)
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (this.nomisFailed) {
      if (!this.body.informationFromPrison) {
        errors.informationFromPrison = 'You must state if you have any information from prison'
      }

      if (this.body.informationFromPrison === 'yes' && !this.body.informationFromPrisonDetail) {
        errors.informationFromPrisonDetail = 'You must provide detail of the information you have from prison'
      }
    }

    if (this.body.selectedCaseNotes.length > 10) {
      errors.selectedCaseNotes = 'You can only select up to 10 prison case notes that support this application'
    }

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
