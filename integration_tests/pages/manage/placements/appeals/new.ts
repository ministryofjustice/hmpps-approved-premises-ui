import { Cas1SpaceBooking } from '@approved-premises/api'
import paths from '../../../../../server/paths/manage'
import Page from '../../../page'

type FieldType = 'text' | 'textArea' | 'date' | 'radio'
export type FieldDetails = Record<string, { type: FieldType; error?: string; value: string; label: string }>

export class NewPlacementAppealPage extends Page {
  fieldDetails: FieldDetails = {
    areaManagerName: {
      type: 'text',
      error: 'You must provide the name of the approving area manager',
      value: 'manager name',
      label: 'Which area manager approved?',
    },
    areaManagerEmail: {
      type: 'text',
      error: 'You must provide the email address of the approving area manager',
      label: 'What is their email address?',
      value: 'manager.email@gov.uk',
    },
    approvalDate: {
      type: 'date',
      error: 'You must enter the date of the approval',
      label: 'When was this approved?',
      value: '2025-04-01',
    },
    appealReason: {
      type: 'radio',
      error: 'You must select a reason for the appeal',
      label: 'Select the reason for the appeal and give details',
      value: 'offenceNotAccepted',
    },
    notes: {
      type: 'textArea',
      label: 'Is there anything else that the CRU need to know?',
      value: 'Some additional notes',
    },
  }

  reasonDetailsFieldDetails: FieldDetails = {
    offenceNotAcceptedDetail: {
      type: 'textArea',
      error: 'You must enter more details',
      label: 'Say which offence is not accepted by the AP.',
      value: 'Details for Offence not accepted',
    },
  }

  constructor(private readonly placement: Cas1SpaceBooking) {
    super('Request an appeal against a placement')
  }

  static visit(placement: Cas1SpaceBooking): NewPlacementAppealPage {
    cy.visit(paths.premises.placements.appeal.new({ placementId: placement.id, premisesId: placement.premises.id }))
    return new NewPlacementAppealPage(placement)
  }

  shouldShowFormControls(fieldDetails: FieldDetails) {
    Object.values(fieldDetails).forEach(({ type, label }) => {
      if (['date', 'radio'].includes(type)) this.getLegend(label)
      else this.getLabel(label)
    })
  }

  shouldShowErrorMessages(fieldDetails: FieldDetails) {
    Object.entries(fieldDetails).forEach(([field, { error }]) => {
      if (error) {
        cy.get('.govuk-error-summary').should('contain', error)
        cy.get(`[data-cy-error-${field.toLowerCase()}]`).should('contain', error)
      }
    })
  }

  completeForm(fieldDetails: FieldDetails) {
    Object.entries(fieldDetails).forEach(([field, { type, value }]) => {
      if (type === 'text') this.completeTextInput(field, value)
      if (type === 'textArea') this.completeTextArea(field, value)
      if (type === 'date') this.clearAndCompleteDateInputs(field, value)
      if (type === 'radio') this.checkRadioByNameAndValue(field, value)
    })
  }

  getRequestJson() {
    const expectedDetails = { ...this.fieldDetails, ...this.reasonDetailsFieldDetails }

    const resultObject = [
      'areaManagerName',
      'areaManagerEmail',
      'appealReason',
      'approvalDate',
      'notes',
      'offenceNotAcceptedDetail',
    ].reduce((out, field) => {
      out[field] = expectedDetails[field].value
      return out
    }, {})

    return JSON.stringify(resultObject)
  }
}
