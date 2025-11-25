/* istanbul ignore file */

import EnterRiskLevel from './enterRiskLevel'
import IsExceptionalCase from './isExceptionalCase'
import ConfirmYourDetails from './confirmYourDetails'
import ExceptionDetails from './exceptionDetails'
import SentenceType from '../../../shared/sentenceType'
import ReleaseType from './releaseType'
import Situation from './situation'
import ReleaseDate from './releaseDate'
import OralHearing from './oralHearing'
import PlacementDate from './placementDate'
import PlacementPurpose from './placementPurpose'
import ReasonForShortNotice from './reasonForShortNotice'
import IsPersonTransgender from './isPersonTransgender'
import ComplexCaseBoard from './complexCaseBoard'
import BoardTakenPlace from './boardTakenPlace'
import MaleAp from './maleAp'
import PauseApplication from './pauseApplication'
import ReferToDelius from './referToDelius'
import NotEligible from './notEligible'
import RelevantDates from './relevantDates'
import ManagedByMappa from './managedByMappa'
import { Task } from '../../../utils/decorators'
import CaseManagerInformation from './caseManagerInformation'

@Task({
  name: 'Basic Information',
  slug: 'basic-information',
  pages: [
    EnterRiskLevel,
    IsExceptionalCase,
    ConfirmYourDetails,
    CaseManagerInformation,
    IsPersonTransgender,
    ComplexCaseBoard,
    BoardTakenPlace,
    MaleAp,
    NotEligible,
    PauseApplication,
    ReferToDelius,
    ExceptionDetails,
    SentenceType,
    ManagedByMappa,
    ReleaseType,
    RelevantDates,
    Situation,
    ReleaseDate,
    OralHearing,
    PlacementDate,
    PlacementPurpose,
    ReasonForShortNotice,
  ],
})
export default class BasicInformation {}

export const pages = {
  SentenceType,
}
