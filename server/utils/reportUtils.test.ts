import { reportOptions } from './reportUtils'

describe('reportUtils', () => {
  describe('reportOptions', () => {
    it('should return a list of report options', () => {
      expect(reportOptions).toEqual([
        {
          value: 'applications',
          text: 'Raw Applications',
          hint: {
            text: 'A raw data extract for applications submitted within the month. Includes data up to the point of assessment completion.',
          },
        },
        {
          value: 'placementApplications',
          text: 'Raw requests for placement',
          hint: {
            text: 'A raw data extract for request for placements created within the month. Includes application data, but does not include matching or booking data.',
          },
        },
        {
          value: 'placementMatchingOutcomes',
          text: 'Raw data for Placement matching outcomes',
          hint: {
            text: 'A raw data extract to help identify placement matching outcomes. This downloads Match requests based on the Expected Arrival Date.',
          },
        },
        {
          value: 'lostBeds',
          text: 'Lost beds',
          hint: {
            text: 'A report on all lost beds for that month and how long they were unavailable for.',
          },
        },
        {
          value: 'dailyMetrics',
          text: 'Daily metrics',
          hint: {
            text: 'Counts of key actions across the service grouped by day.',
          },
        },
      ])
    })
  })
})
