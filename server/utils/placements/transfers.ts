import { SummaryList, TransferFormData } from '@approved-premises/ui'
import { Cas1PremisesBasicSummary } from '@approved-premises/api'
import { DateFormats } from '../dateUtils'

export const allApprovedPremisesOptions = (approvedPremises: Array<Cas1PremisesBasicSummary>) => [
  {
    value: null,
    text: 'Select an Approved Premises',
  },
  ...approvedPremises.map(premises => ({
    value: premises.id,
    text: `${premises.name} (${premises.apArea.name})`,
  })),
]

export const transferSummaryList = (formData: TransferFormData): SummaryList => {
  return {
    rows: [
      {
        key: { text: 'Date of transfer' },
        value: { text: DateFormats.isoDateToUIDate(formData.transferDate) },
      },
      {
        key: { text: 'Reason for transfer' },
        value: { text: 'Emergency transfer' },
      },
      {
        key: { text: 'Transfer AP' },
        value: { text: formData.destinationPremisesName },
      },
      {
        key: { text: 'Placement end date' },
        value: { text: DateFormats.isoDateToUIDate(formData.placementEndDate) },
      },
    ],
  }
}
