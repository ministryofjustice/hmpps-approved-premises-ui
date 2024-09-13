import { ApType } from '../@types/shared'

export const apTypeLabels: Record<ApType, string> = {
  normal: 'Standard AP',
  pipe: 'Psychologically Informed Planned Environment (PIPE)',
  esap: 'Enhanced Security AP (ESAP)',
  mhapElliottHouse: 'Specialist mental health AP (Elliot House, East Midlands)',
  mhapStJosephs: 'Specialist mental health AP (St Joseph’s, Greater Manchester)',
  rfap: 'Recovery Focused AP (RFAP)',
} as const

export type ApTypeLabel = (typeof apTypeLabels)[ApType]
