import FormPage, { FieldDetails } from '../../../formPage'

export class PlannedDetailsPage extends FormPage {
  fieldDetails: FieldDetails = {
    isFlexible: {
      type: 'radio',
      error: 'You must indicate if the transfer date is flexible',
      value: 'no',
      label: 'Is the date flexible?',
    },
    transferReason: {
      type: 'radio',
      error: 'You must choose a reason for the transfer',
      label: 'Select a reason for the transfer',
      value: 'placementPrioritisation',
    },
    notes: {
      type: 'textArea',
      error: 'You must give the details of the transfer',
      label: 'Provide details about the transfer',
      value: 'Some additional notes',
    },
  }

  constructor() {
    super('Enter the transfer details')
  }
}
