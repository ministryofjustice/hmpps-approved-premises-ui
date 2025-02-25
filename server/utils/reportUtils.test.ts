import { reportOptions } from './reportUtils'
import { userDetailsFactory } from '../testutils/factories'

describe('reportUtils', () => {
  describe('reportOptions', () => {
    it('should return a list of report options, excluding pii by default', () => {
      const user = userDetailsFactory.build({ permissions: [] })
      expect(reportOptions(user)).toEqual([
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
            text: 'A raw data extract for applications submitted or withdrawn within the month.',
          },
        },
        {
          value: 'requestsForPlacement',
          text: 'Raw Requests for Placement for Performance Hub',
          hint: {
            text: 'A raw data extract for requests for placements created or withdrawn within the month.',
          },
        },
        {
          value: 'placementMatchingOutcomesV2',
          text: 'Raw Placement Matching Outcomes Reports V2',
          hint: {
            text: 'A raw data extract providing placement matching outcomes for placement requests with an expected arrival within the month.',
          },
        },
      ])
    })

    it('should return a list of report options, including pii if user has permission', () => {
      const userWithPiiPermissions = userDetailsFactory.build({
        permissions: ['cas1_reports_view_with_pii'],
      })
      expect(reportOptions(userWithPiiPermissions)).toEqual([
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
            text: 'A raw data extract for applications submitted or withdrawn within the month.',
          },
        },
        {
          value: 'applicationsV2WithPii',
          text: 'Raw Applications for Performance Hub (PII)',
          hint: {
            text: 'A raw data extract for applications submitted or withdrawn within the month, including PII.',
          },
        },
        {
          value: 'requestsForPlacement',
          text: 'Raw Requests for Placement for Performance Hub',
          hint: {
            text: 'A raw data extract for requests for placements created or withdrawn within the month.',
          },
        },
        {
          value: 'requestsForPlacementWithPii',
          text: 'Raw Requests for Placement for Performance Hub (PII)',
          hint: {
            text: 'A raw data extract for requests for placements created or withdrawn within the month, including PII.',
          },
        },
        {
          value: 'placementMatchingOutcomesV2',
          text: 'Raw Placement Matching Outcomes Reports V2',
          hint: {
            text: 'A raw data extract providing placement matching outcomes for placement requests with an expected arrival within the month.',
          },
        },
        {
          value: 'placementMatchingOutcomesV2WithPii',
          text: 'Raw Placement Matching Outcomes Reports V2 (PII)',
          hint: {
            text: 'A raw data extract providing placement matching outcomes for placement requests with an expected arrival within the month, including PII.',
          },
        },
      ])
    })
  })
})
