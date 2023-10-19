export const reportNames = {
  'daily-metrics': 'Daily Metrics',
  'placement-metrics': 'Placement Metrics',
  'referrals-by-ap-type': 'Referrals by AP Type',
  'referrals-by-tier': 'Referrals by Tier',
  applications: 'Applications',
  'lost-beds': 'Lost Beds',
} as const

export type ReportType = (keyof typeof reportNames)[number]
