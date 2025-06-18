import { UserDetails } from '@approved-premises/ui'
import { hasPermission } from './users'

export const reportInputLabels = {
  outOfServiceBeds: {
    text: 'Out of service beds',
    hint: 'A report of all out of service beds within the month and how long they were unavailable for.',
  },
  outOfServiceBedsWithPii: {
    text: 'Out of service beds (PII)',
    hint: 'Includes additional columns of PII data.',
  },
  dailyMetrics: {
    text: 'Daily metrics',
    hint: 'Counts of key actions across the service grouped by day.',
  },
  applicationsV2: {
    text: 'Raw Applications for Performance Hub',
    hint: 'Applications submitted or withdrawn within the requested month.',
  },
  applicationsV2WithPii: {
    text: 'Raw Applications for Performance Hub (PII)',
    hint: 'Includes additional columns of PII data.',
  },
  requestsForPlacement: {
    text: 'Raw Requests for Placement for Performance Hub',
    hint: 'Requests for placements submitted or withdrawn within the requested month.',
  },
  requestsForPlacementWithPii: {
    text: 'Raw Requests for Placement for Performance Hub (PII)',
    hint: 'Includes additional columns of PII data.',
  },
  placementMatchingOutcomesV2: {
    text: 'Raw Placement Matching Outcomes Report V2',
    hint: 'Placement matching outcomes for placement requests with a requested arrival within the month. This includes withdrawn requests.',
  },
  placementMatchingOutcomesV2WithPii: {
    text: 'Raw Placement Matching Outcomes Report V2 (PII)',
    hint: 'Includes additional columns of PII data.',
  },
  placements: {
    text: 'Raw Placement Report',
    hint: 'Placements where the following fall within the requested month - expected arrival/departure, actual arrival/departure, non arrival, withdrawal. This only includes placements for regions taking part in the Find and Booking Private Beta.',
  },
  placementsWithPii: {
    text: 'Raw Placement Report (PII)',
    hint: 'Includes additional columns of PII data.',
  },
} as const

export type ReportType = (keyof typeof reportInputLabels)[number]

export const unusedReports = [] as Array<string>

export const piiReports = [
  'applicationsV2WithPii',
  'outOfServiceBedsWithPii',
  'requestsForPlacementWithPii',
  'placementMatchingOutcomesV2WithPii',
  'placementsWithPii',
] as Array<string>

export const reportOptions = (user: UserDetails): Array<{ value: string; text: string; hint: { text: string } }> => {
  return Object.entries(reportInputLabels)
    .filter(([reportName]) => {
      return !unusedReports.includes(reportName)
    })
    .filter(([reportName]) => {
      return !piiReports.includes(reportName) || hasPermission(user, ['cas1_reports_view_with_pii'])
    })
    .map(([reportName, reportLabel]) => ({
      value: reportName,
      text: reportLabel.text,
      hint: { text: reportLabel.hint },
    }))
}
