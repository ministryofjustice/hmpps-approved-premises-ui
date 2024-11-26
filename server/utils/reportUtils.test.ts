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
          value: 'lostBeds',
          text: 'Lost beds (no longer in use)',
          hint: {
            text: 'This report provides information on lost beds recorded before out of service beds functionality was enabled. This will be removed in the near future.',
          },
        },
        {
          value: 'outOfServiceBeds',
          text: 'Out of service beds',
          hint: {
            text: 'A report of all out of service beds within the month and how long they were unavailable for.',
          },
        },
        {
          value: 'dailyMetrics',
          text: 'Daily metrics',
          hint: {
            text: 'Counts of key actions across the service grouped by day.',
          },
        },
        {
          value: 'applicationsV2',
          text: 'Raw Applications for Performance Hub',
          hint: {
            text: 'A raw data extract for applications submitted or withdrawn within the month. Does not include any PII.',
          },
        },
        {
          value: 'requestsForPlacement',
          text: 'Raw Requests for Placement for Performance Hub',
          hint: {
            text: 'A raw data extract for requests for placements created or withdrawn within the month. Does not include any PII.',
          },
        },
      ])
    })
  })
})
