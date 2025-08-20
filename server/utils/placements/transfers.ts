import { ChangeRequestReason, SummaryList, TransferFormData } from '@approved-premises/ui'
import { Cas1PremisesBasicSummary } from '@approved-premises/api'
import type { Request, Response } from 'express'
import { addDays, isBefore } from 'date-fns'
import { Params } from 'static-path'
import { dateAndTimeInputsAreValidDates, DateFormats } from '../dateUtils'
import { summaryListItem } from '../formUtils'
import { getChangeRequestReasonText } from './changeRequests'
import { sentenceCase } from '../utils'
import { ValidationError } from '../errors'
import managePaths from '../../paths/manage'

export const plannedTransferSuccessMessage = {
  heading: 'Transfer requested',
  body: `<p>Your request has been submitted to the CRU to progress.</p>
<p>If progressed, you must record the person as departed on the date of transfer and use the move-on category for transfer.</p>`,
}

export const allApprovedPremisesOptions = (approvedPremises: Array<Cas1PremisesBasicSummary>) => [
  {
    value: null,
    text: 'Select an Approved Premises',
  },
  ...approvedPremises
    .filter(premises => premises.supportsSpaceBookings)
    .map(premises => ({
      value: premises.id,
      text: `${premises.name} (${premises.apArea.name})`,
    })),
]

export const emergencyTransferSummaryList = (formData: TransferFormData): SummaryList => ({
  rows: [
    summaryListItem('Date of transfer', formData.transferDate, 'date'),
    summaryListItem('Reason for transfer', 'Emergency transfer'),
    summaryListItem('Transfer AP', formData.destinationPremisesName),
    summaryListItem('Placement end date', formData.placementEndDate, 'date'),
  ],
})

export const plannedTransferSummaryList = (formData: TransferFormData): SummaryList => ({
  rows: [
    summaryListItem('Date of transfer', formData.transferDate, 'date'),
    summaryListItem('Is the date flexible', sentenceCase(formData.isFlexible)),
    summaryListItem('Reason for transfer', getChangeRequestReasonText(formData.transferReason as ChangeRequestReason)),
    summaryListItem('Any other information', formData.notes, 'textBlock'),
  ],
})

export const validateNew = (req: Request, res: Response, body: TransferFormData = {}): void => {
  const errors: Record<string, string> = {}
  const { transferDate } = body

  if (!Object.keys(body).length) {
    errors.session = 'Session expired'
  } else {
    if (!transferDate) {
      errors.transferDate = 'You must enter a transfer date'
    } else if (!dateAndTimeInputsAreValidDates(body, 'transferDate')) {
      errors.transferDate = 'You must enter a valid transfer date'
    }
    const oneWeekAgo = DateFormats.dateObjToIsoDate(addDays(new Date(), -7))
    if (isBefore(transferDate, oneWeekAgo)) {
      errors.transferDate = 'The date of transfer cannot be earlier than one week ago'
    }
  }

  if (Object.keys(errors).length) {
    throw new ValidationError(errors, managePaths.premises.placements.transfers.new(req.params as Params<string>))
  }

  return undefined
}
