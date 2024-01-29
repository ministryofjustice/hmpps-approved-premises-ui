export const reportNames = {
  'daily-metrics': 'Daily Metrics',
  'placement-metrics': 'Placement Metrics',
  'referrals-by-ap-type': 'Referrals by AP Type',
  'referrals-by-tier': 'Referrals by Tier',
  applications: 'Combined applications and placement requests',
  referrals: 'Applications',
  'lost-beds': 'Lost Beds',
  'placement-applications': 'Placement Requests',
} as const

export type ReportType = (keyof typeof reportNames)[number]

export const reportOptions = Object.entries(reportNames)
  .sort((a, b) => (a[1] > b[1] ? 1 : -1))
  .map(e => ({ value: e[0], text: e[1] }))
