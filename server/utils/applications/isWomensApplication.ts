import type { ApprovedPremisesApplication as Application, FullPerson } from '@approved-premises/api'
import complexCaseBoard from '../../form-pages/apply/reasons-for-placement/basic-information/complexCaseBoard'
import boardTakenPlace from '../../form-pages/apply/reasons-for-placement/basic-information/boardTakenPlace'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import MaleAp from '../../form-pages/apply/reasons-for-placement/basic-information/maleAp'
import IsPersonTransgender from '../../form-pages/apply/reasons-for-placement/basic-information/isPersonTransgender'

export const isWomensApplication = (application: Application): boolean => {
  const { sex } = application.person as FullPerson

  const transgenderOrHasTransgenderHistory = retrieveOptionalQuestionResponseFromFormArtifact(
    application,
    IsPersonTransgender,
    'transgenderOrHasTransgenderHistory',
  )

  const complexCaseBoardReviewRequired = retrieveOptionalQuestionResponseFromFormArtifact(
    application,
    complexCaseBoard,
    'reviewRequired',
  )

  const complexCaseBoardTakenPlace = retrieveOptionalQuestionResponseFromFormArtifact(
    application,
    boardTakenPlace,
    'hasBoardTakenPlace',
  )

  const shouldPersonBePlacedInMaleAp = retrieveOptionalQuestionResponseFromFormArtifact(
    application,
    MaleAp,
    'shouldPersonBePlacedInMaleAp',
  )

  const transgenderOverride =
    transgenderOrHasTransgenderHistory === 'yes' &&
    complexCaseBoardReviewRequired === 'yes' &&
    complexCaseBoardTakenPlace === 'yes' &&
    shouldPersonBePlacedInMaleAp

  return transgenderOverride ? transgenderOverride === 'no' : sex === 'Female'
}
