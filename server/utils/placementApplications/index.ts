import { PlacementApplication, ReleaseTypeOption, SentenceTypeOption, SituationOption } from '@approved-premises/api'
import { YesOrNo } from '@approved-premises/ui'

export * as tableUtils from './table'

export const getSentenceType = (
  placementApplication: PlacementApplication,
): {
  sentenceTypeCheck: YesOrNo
  sentenceType: SentenceTypeOption
  releaseType: ReleaseTypeOption
  situation: SituationOption
} => {
  const pageData = placementApplication.data?.['request-a-placement']
  const {
    applicationReleaseType,
    sentenceTypeCheck,
    applicationSentenceType,
    situation,
  }: {
    sentenceTypeCheck: YesOrNo
    applicationReleaseType: ReleaseTypeOption
    applicationSentenceType: SentenceTypeOption
    situation: SituationOption
  } = pageData?.['sentence-type-check'] || {}
  const { releaseType: updatedReleaseType }: { releaseType: ReleaseTypeOption } = pageData?.['release-type'] || {}
  const { sentenceType: updatedSentenceType }: { sentenceType: SentenceTypeOption } = pageData?.['sentence-type'] || {}
  const { situation: updatedSituation }: { situation: SituationOption } = pageData?.situation || {}

  const updated = sentenceTypeCheck === 'yes'

  return {
    sentenceTypeCheck,
    releaseType: updated ? updatedReleaseType : applicationReleaseType,
    sentenceType: updated ? updatedSentenceType : applicationSentenceType,
    situation: updated ? updatedSituation : situation,
  }
}
