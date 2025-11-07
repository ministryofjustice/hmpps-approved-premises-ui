import { PlacementApplication, ReleaseTypeOption, SentenceTypeOption, SituationOption } from '@approved-premises/api'
import { YesOrNo } from '@approved-premises/ui'

export * as tableUtils from './table'

export const substituteReleaseType = (sentenceType: SentenceTypeOption, releaseType: ReleaseTypeOption) => {
  if (sentenceType === 'nonStatutory') {
    return 'not_applicable'
  }

  if (sentenceType === 'communityOrder' || sentenceType === 'bailPlacement') {
    return 'in_community'
  }
  return releaseType
}

export const getSentenceType = (
  placementApplication: PlacementApplication,
): {
  sentenceTypeCheck: YesOrNo
  sentenceType: SentenceTypeOption
  releaseType: ReleaseTypeOption
  situation: SituationOption
} => {
  const pageData = placementApplication.data?.['request-a-placement']
  const { sentenceTypeCheck } = pageData?.['sentence-type-check'] || {}

  if (sentenceTypeCheck === 'yes') {
    const { releaseType }: { releaseType: ReleaseTypeOption } = pageData?.['release-type'] || {}
    const { sentenceType }: { sentenceType: SentenceTypeOption } = pageData?.['sentence-type'] || {}
    const { situation }: { situation: SituationOption } = pageData?.situation || {}
    return {
      sentenceTypeCheck,
      releaseType: substituteReleaseType(sentenceType, releaseType),
      sentenceType,
      situation,
    }
  }
  const {
    applicationReleaseType: releaseType,
    applicationSentenceType: sentenceType,
    situation,
  }: {
    applicationReleaseType: ReleaseTypeOption
    applicationSentenceType: SentenceTypeOption
    situation: SituationOption
  } = pageData?.['sentence-type-check'] || {}
  return {
    sentenceTypeCheck,
    releaseType,
    sentenceType,
    situation,
  }
}
