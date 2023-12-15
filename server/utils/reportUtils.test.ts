import { reportOptions } from './reportUtils'

describe('reportUtils', () => {
  describe('reportOptions', () => {
    it('should return a list of report options', () => {
      expect(reportOptions).toEqual([
        { value: 'applications', text: 'Applications' },
        { value: 'daily-metrics', text: 'Daily Metrics' },
        { value: 'lost-beds', text: 'Lost Beds' },
        { value: 'placement-metrics', text: 'Placement Metrics' },
        { value: 'referrals', text: 'Referrals' },
        { value: 'referrals-by-ap-type', text: 'Referrals by AP Type' },
        { value: 'referrals-by-tier', text: 'Referrals by Tier' },
      ])
    })
  })
})
