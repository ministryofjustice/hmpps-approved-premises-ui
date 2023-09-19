export const sentenceTypes = {
  standardDeterminate: 'Standard determinate custody',
  life: 'Life sentence',
  ipp: 'Indeterminate Public Protection (IPP)',
  extendedDeterminate: 'Extended determinate custody',
  communityOrder: 'Community Order (CO) / Suspended Sentence Order (SSO)',
  bailPlacement: 'Bail placement',
  nonStatutory: 'Non-statutory, MAPPA case',
} as const

export type SentenceTypesT = keyof typeof sentenceTypes

export const adjacentPageFromSentenceType = (sentenceType: SentenceTypesT) => {
  switch (sentenceType) {
    case 'standardDeterminate':
      return 'release-type'
    case 'communityOrder':
      return 'situation'
    case 'bailPlacement':
      return 'situation'
    case 'extendedDeterminate':
      return 'release-type'
    case 'ipp':
      return 'release-type'
    case 'nonStatutory':
      return 'managed-by-mappa'
    case 'life':
      return 'release-type'
    default:
      throw new Error('The release type is invalid')
  }
}
