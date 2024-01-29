import { reportOptions } from './reportUtils'

describe('reportUtils', () => {
  describe('reportOptions', () => {
    it('should return a list of report options', () => {
      expect(reportOptions).toEqual([
        { value: 'referrals', text: 'Applications' },
        { value: 'applications', text: 'Combined applications and placement requests' },
        { value: 'daily-metrics', text: 'Daily Metrics' },
        { value: 'lost-beds', text: 'Lost Beds' },
        { value: 'placement-metrics', text: 'Placement Metrics' },
        { value: 'placement-applications', text: 'Placement Requests' },
        { value: 'referrals-by-ap-type', text: 'Referrals by AP Type' },
        { value: 'referrals-by-tier', text: 'Referrals by Tier' },
      ])
    })
  })
})
