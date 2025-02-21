import { reportOptions } from './reportUtils'

describe('reportUtils', () => {
  describe('reportOptions', () => {
    it('should return a list of report options', () => {
      expect(reportOptions).toEqual([
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
            text: 'A raw data extract for applications submitted or withdrawn within the month. Excludes PII.',
          },
        },
        {
          value: 'requestsForPlacement',
          text: 'Raw Requests for Placement for Performance Hub',
          hint: {
            text: 'A raw data extract for requests for placements created or withdrawn within the month. Excludes PII.',
          },
        },
        {
          value: 'placementMatchingOutcomesV2',
          text: 'Raw Placement Matching Outcomes Reports (V2)',
          hint: {
            text: 'A raw data extract providing placement matching outcomes for placement requests with an expected arrival within the month. Excludes PII.',
          },
        },
      ])
    })
  })
})
