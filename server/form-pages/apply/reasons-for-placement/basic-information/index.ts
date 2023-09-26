/* istanbul ignore file */

import IsExceptionalCase from './isExceptionalCase'
import ConfirmYourDetails from './confirmYourDetails'
import ExceptionDetails from './exceptionDetails'
import SentenceType from './sentenceType'
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
import EndDates from './endDates'
import ManagedByMappa from './managedByMappa'
import { Task } from '../../../utils/decorators'
import CaseManagerInformation from './caseManagerInformation'

@Task({
  name: 'Basic Information',
  slug: 'basic-information',
  pages: [
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
    EndDates,
    Situation,
    ReleaseDate,
    OralHearing,
    PlacementDate,
    PlacementPurpose,
    ReasonForShortNotice,
  ],
})
export default class BasicInformation {}
