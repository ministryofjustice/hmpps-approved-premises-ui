import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import {
  Cas1RequestedPlacementPeriod,
  type ReleaseTypeOption,
  SentenceTypeOption,
  SituationOption,
  SubmitPlacementApplication,
} from '@approved-premises/api'
import { allReleaseTypes } from '../../utils/applications/releaseTypeUtils'

export default Factory.define<SubmitPlacementApplication>(() => {
  const sentenceTypes: Array<SentenceTypeOption> = [
    'standardDeterminate',
    'life',
    'ipp',
    'extendedDeterminate',
    'communityOrder',
    'bailPlacement',
    'nonStatutory',
  ]
  const situationOptions: Array<SituationOption> = [
    'riskManagement',
    'residencyManagement',
    'bailAssessment',
    'bailSentence',
    'awaitingSentence',
  ]
  return {
    requestedPlacementPeriods: [] as Array<Cas1RequestedPlacementPeriod>,
    releaseType: faker.helpers.arrayElement(Object.keys(allReleaseTypes)) as ReleaseTypeOption,
    sentenceType: faker.helpers.arrayElement(sentenceTypes),
    situationType: faker.helpers.arrayElement(situationOptions),
    translatedDocument: {},
  }
})
