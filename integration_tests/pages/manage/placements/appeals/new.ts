import { Cas1SpaceBooking } from '@approved-premises/api'
import paths from '../../../../../server/paths/manage'

import FormPage, { FieldDetails } from '../../../formPage'

export class NewPlacementAppealPage extends FormPage {
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
