import { SentenceTypeOption } from '../../@types/shared'

export const sentenceTypes: Record<SentenceTypeOption, string> = {
  standardDeterminate: 'Standard determinate custody',
  life: 'Life sentence',
  ipp: 'Indeterminate Public Protection (IPP)',
  extendedDeterminate: 'Extended determinate custody',
  communityOrder: 'Community Order (CO) / Suspended Sentence Order (SSO)',
  bailPlacement: 'Bail placement / Pre-sentence application',
  nonStatutory: 'Non-statutory, MAPPA case',
}

export const adjacentPageFromSentenceType = (sentenceType: SentenceTypeOption) => {
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
      throw new Error('The sentence type is invalid')
  }
}
