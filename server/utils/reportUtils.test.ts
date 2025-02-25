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
            text: 'Applications submitted or withdrawn within the requested month.',
          },
        },
        {
          value: 'requestsForPlacement',
          text: 'Raw Requests for Placement for Performance Hub',
          hint: {
            text: 'Requests for placements submitted or withdrawn within the requested month.',
          },
        },
        {
          value: 'placementMatchingOutcomesV2',
          text: 'Raw Placement Matching Outcomes Reports V2',
          hint: {
            text: 'Placement matching outcomes for placement requests with a requested arrival within the month. This includes withdrawn requests.',
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
            text: 'Applications submitted or withdrawn within the requested month.',
          },
        },
        {
          value: 'applicationsV2WithPii',
          text: 'Raw Applications for Performance Hub (PII)',
          hint: {
            text: 'Includes additional columns of PII data.',
          },
        },
        {
          value: 'requestsForPlacement',
          text: 'Raw Requests for Placement for Performance Hub',
          hint: {
            text: 'Requests for placements submitted or withdrawn within the requested month.',
          },
        },
        {
          value: 'requestsForPlacementWithPii',
          text: 'Raw Requests for Placement for Performance Hub (PII)',
          hint: {
            text: 'Includes additional columns of PII data.',
          },
        },
        {
          value: 'placementMatchingOutcomesV2',
          text: 'Raw Placement Matching Outcomes Reports V2',
          hint: {
            text: 'Placement matching outcomes for placement requests with a requested arrival within the month. This includes withdrawn requests.',
          },
        },
        {
          value: 'placementMatchingOutcomesV2WithPii',
          text: 'Raw Placement Matching Outcomes Reports V2 (PII)',
          hint: {
            text: 'Includes additional columns of PII data.',
          },
        },
      ])
    })
  })
})
