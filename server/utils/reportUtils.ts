export const reportInputLabels = {
  referrals: {
    text: 'Raw Applications',
    hint: 'A raw data extract for applications submitted within the month. Includes data up to the point of assessment completion.',
  },
  'placement-applications': {
    text: 'Raw requests for placement',
    hint: 'A raw data extract for request for placements created within the month. Includes application data, but does not include matching or booking data.',
  },
  applications: { text: 'Raw combined applications and placement requests', hint: '' },
  'placement-matching-outcomes': {
    text: 'Raw data for Placement matching outcomes',
    hint: 'A raw data extract to help identify placement matching outcomes. This downloads Match requests based on the Expected Arrival Date.',
  },
  'lost-beds': {
    text: 'Lost beds',
    hint: 'A report on all lost beds for that month and how long they were unavailable for.',
  },
  'daily-metrics': { text: 'Daily metrics', hint: 'Counts of key actions across the service grouped by day.' },
} as const

export type ReportType = (keyof typeof reportInputLabels)[number]

export const reportOptions = Object.entries(reportInputLabels).map(([reportName, reportLabel]) => ({
  value: reportName,
  text: reportLabel.text,
  hint: { text: reportLabel.hint },
}))
