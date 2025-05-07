import { SummaryList, TransferFormData } from '@approved-premises/ui'
import { Cas1PremisesBasicSummary } from '@approved-premises/api'
import { DateFormats } from '../dateUtils'
import { summaryListItem } from '../formUtils'

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

export const transferSummaryList = (formData: TransferFormData): SummaryList => {
  return {
    rows: [
      summaryListItem('Date of transfer', DateFormats.isoDateToUIDate(formData.transferDate)),
      summaryListItem('Reason for transfer', 'Emergency transfer'),
      summaryListItem('Transfer AP', formData.destinationPremisesName),
      summaryListItem('Placement end date', DateFormats.isoDateToUIDate(formData.placementEndDate)),
    ],
  }
}
