export const reportInputLabels = {
  applications: {
    text: 'Raw Applications',
    hint: 'A raw data extract for applications submitted within the month. Includes data up to the point of assessment completion.',
  },
  placementApplications: {
    text: 'Raw requests for placement',
    hint: 'A raw data extract for request for placements created within the month. Includes application data, but does not include matching or booking data.',
  },
  placementMatchingOutcomes: {
    text: 'Raw data for Placement matching outcomes',
    hint: 'A raw data extract to help identify placement matching outcomes. This downloads Match requests based on the Expected Arrival Date.',
  },
  lostBeds: {
    text: 'Lost beds (no longer in use)',
    hint: 'This report provides information on lost beds recorded before out of service beds functionality was enabled. This will be removed in the near future.',
  },
  outOfServiceBeds: {
    text: 'Out of service beds',
    hint: 'A report of all out of service beds within the month and how long they were unavailable for.',
  },
  dailyMetrics: { text: 'Daily metrics', hint: 'Counts of key actions across the service grouped by day.' },
  applicationsV2: {
    text: 'Raw Applications for Performance Hub',
    hint: 'A raw data extract for applications submitted or withdrawn within the month. Excludes PII.',
  },
  requestsForPlacement: {
    text: 'Raw Requests for Placement for Performance Hub',
    hint: 'A raw data extract for requests for placements created or withdrawn within the month. Excludes PII.',
  },
  placementMatchingOutcomesV2: {
    text: 'Raw Placement Matching Outcomes Reports (V2)',
    hint: 'A raw data extract providing placement matching outcomes for placement requests with an expected arrival within the month. Excludes PII.',
  },
} as const

export type ReportType = (keyof typeof reportInputLabels)[number]

export const unusedReports = [
  'applications',
  'placementApplications',
  'placementMatchingOutcomes',
  'lostBeds',
] as Array<string>

export const reportOptions = Object.entries(reportInputLabels)
  .filter(([reportName]) => {
    return !unusedReports.includes(reportName)
  })
  .map(([reportName, reportLabel]) => ({
    value: reportName,
    text: reportLabel.text,
    hint: { text: reportLabel.hint },
  }))
