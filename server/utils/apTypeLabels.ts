import { ApType, Cas1SpaceCharacteristic } from '../@types/shared'

export const apTypeLongLabels: Record<ApType, string> = {
  normal: 'Standard (all AP types)',
  pipe: 'Psychologically Informed Planned Environment (PIPE)',
  esap: 'Enhanced Security AP (ESAP)',
  rfap: 'Recovery Focused AP (RFAP)',
  mhapElliottHouse: 'Specialist Mental Health AP (Elliott House, Midlands)',
  mhapStJosephs: 'Specialist Mental Health AP (St Josephs, Greater Manchester)',
} as const

export const apTypeShortLabels: Record<ApType, string> = {
  normal: 'Standard',
  pipe: 'PIPE',
  esap: 'ESAP',
  rfap: 'RFAP',
  mhapElliottHouse: 'Specialist Mental Health - Elliott House',
  mhapStJosephs: 'Specialist Mental Health - St Josephs',
} as const

export type ApTypeLabel = (typeof apTypeLongLabels)[ApType]

export const apTypeToSpaceCharacteristicMap: Record<ApType, Cas1SpaceCharacteristic> = {
  normal: undefined,
  pipe: 'isPIPE',
  esap: 'isESAP',
  rfap: 'isRecoveryFocussed',
  mhapElliottHouse: 'isMHAPElliottHouse',
  mhapStJosephs: 'isMHAPStJosephs',
}
