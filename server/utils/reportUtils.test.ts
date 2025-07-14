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
            text: 'A report of all out of service beds within the requested date range and how long they were unavailable for.',
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
            text: 'Applications submitted or withdrawn within the requested date range.',
          },
        },
        {
          value: 'requestsForPlacement',
          text: 'Raw Requests for Placement for Performance Hub',
          hint: {
            text: 'Requests for placements submitted or withdrawn within the requested date range.',
          },
        },
        {
          value: 'placementMatchingOutcomesV2',
          text: 'Raw Placement Matching Outcomes Report V2',
          hint: {
            text: 'Placement matching outcomes for placement requests with a requested arrival date within the requested date range. This includes withdrawn requests.',
          },
        },
        {
          value: 'placements',
          text: 'Raw Placement Report',
          hint: {
            text: 'Placements where the following fall within the requested date range - expected arrival/departure, actual arrival/departure, non arrival, withdrawal.',
          },
        },
        {
          value: 'overduePlacements',
          text: 'Overdue Placements',
          hint: {
            text: 'Placements where the expected arrival or departure date falls within the requested date range, and there is an overdue arrival or departure.',
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
            text: 'A report of all out of service beds within the requested date range and how long they were unavailable for.',
          },
        },
        {
          value: 'outOfServiceBedsWithPii',
          text: 'Out of service beds (PII)',
          hint: {
            text: 'Includes additional columns of PII data.',
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
            text: 'Applications submitted or withdrawn within the requested date range.',
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
            text: 'Requests for placements submitted or withdrawn within the requested date range.',
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
          text: 'Raw Placement Matching Outcomes Report V2',
          hint: {
            text: 'Placement matching outcomes for placement requests with a requested arrival date within the requested date range. This includes withdrawn requests.',
          },
        },
        {
          value: 'placementMatchingOutcomesV2WithPii',
          text: 'Raw Placement Matching Outcomes Report V2 (PII)',
          hint: {
            text: 'Includes additional columns of PII data.',
          },
        },
        {
          value: 'placements',
          text: 'Raw Placement Report',
          hint: {
            text: 'Placements where the following fall within the requested date range - expected arrival/departure, actual arrival/departure, non arrival, withdrawal.',
          },
        },
        {
          value: 'placementsWithPii',
          text: 'Raw Placement Report (PII)',
          hint: {
            text: 'Includes additional columns of PII data.',
          },
        },
        {
          value: 'overduePlacements',
          text: 'Overdue Placements',
          hint: {
            text: 'Placements where the expected arrival or departure date falls within the requested date range, and there is an overdue arrival or departure.',
          },
        },
      ])
    })
  })
})
