import { TransferFormData } from '@approved-premises/ui'
import { allApprovedPremisesOptions, transferSummaryList } from './transfers'
import { cas1PremisesBasicSummaryFactory } from '../../testutils/factories'

describe('allApprovedPremisesOptions', () => {
  it('returns a list of approved premises that accept space bookings for use in a govuk select', () => {
    const premises = [
      cas1PremisesBasicSummaryFactory.build({
        name: 'Premises 1',
        supportsSpaceBookings: true,
        apArea: { name: 'Area 1' },
      }),
      cas1PremisesBasicSummaryFactory.build({
        name: 'Premises 2',
        supportsSpaceBookings: false,
        apArea: { name: 'Area 2' },
      }),
      cas1PremisesBasicSummaryFactory.build({
        name: 'Premises 3',
        supportsSpaceBookings: true,
        apArea: { name: 'Area 1' },
      }),
    ]

    expect(allApprovedPremisesOptions(premises)).toEqual([
      {
        text: 'Select an Approved Premises',
        value: null,
      },
      {
        value: premises[0].id,
        text: `Premises 1 (Area 1)`,
      },
      {
        value: premises[2].id,
        text: `Premises 3 (Area 1)`,
      },
    ])
  })
})

describe('transferSummaryRows', () => {
  it('returns a summary list for the transfer', () => {
    const formData: TransferFormData = {
      transferDate: '2025-05-23',
      placementEndDate: '2025-06-30',
      destinationPremisesName: 'Approved Premises Name',
    }

    expect(transferSummaryList(formData)).toMatchObject({
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
