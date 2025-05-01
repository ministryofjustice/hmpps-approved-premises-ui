import { TransferFormData } from '@approved-premises/ui'
import { allApprovedPremisesOptions, transferRequestSummaryList } from './transfers'
import { cas1PremisesBasicSummaryFactory } from '../../testutils/factories'

describe('allApprovedPremisesOptions', () => {
  it('returns a list of approved premises for use in a govuk select', () => {
    const premises = cas1PremisesBasicSummaryFactory.buildList(2)

    expect(allApprovedPremisesOptions(premises)).toEqual([
      {
        value: premises[0].id,
        text: `${premises[0].name} (${premises[0].apArea.name})`,
      },
      {
        value: premises[1].id,
        text: `${premises[1].name} (${premises[1].apArea.name})`,
      },
    ])
  })
})

describe('transferRequestSummaryRows', () => {
  it('returns a summary list for the requested transfer', () => {
    const formData: TransferFormData = {
      transferDate: '2025-05-23',
      placementEndDate: '2025-06-30',
      destinationPremisesName: 'Approved Premises Name',
    }

    expect(transferRequestSummaryList(formData)).toMatchObject({
      rows: [
        {
          key: { text: 'Date of transfer' },
          value: { text: 'Fri 23 May 2025' },
        },
        {
          key: { text: 'Reason for transfer' },
          value: { text: 'Emergency transfer' },
        },
        {
          key: { text: 'Transfer AP' },
          value: { text: 'Approved Premises Name' },
        },
        {
          key: { text: 'Placement end date' },
          value: { text: 'Mon 30 Jun 2025' },
        },
      ],
    })
  })
})
