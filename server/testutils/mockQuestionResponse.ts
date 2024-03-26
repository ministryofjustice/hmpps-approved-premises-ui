import {
  ApprovedPremisesApplication as Application,
  Cas1ApplicationUserDetails as UserDetails,
} from '@approved-premises/api'
import {
  retrieveOptionalQuestionResponseFromFormArtifact,
  retrieveQuestionResponseFromFormArtifact,
} from '../utils/retrieveQuestionResponseFromFormArtifact'
import { applicantAndCaseManagerDetails } from '../utils/applications/applicantAndCaseManagerDetails'

export type RequiredQuestionResponses = {
  postcodeArea?: string
  type?: string
  sentenceType?: string
  releaseType?: string
  duration?: string
  alternativeRadius?: string
  situation?: string
  apAreaId?: string
  applicantUserDetails?: UserDetails
  caseManagerUserDetails?: UserDetails
  caseManagerIsNotApplicant?: boolean
}

export const mockQuestionResponse = ({
  postcodeArea = 'ABC 123',
  type = 'standard',
  sentenceType = 'standardDeterminate',
  releaseType = 'other',
  alternativeRadius,
  duration,
  situation,
  apAreaId,
  applicantUserDetails,
  caseManagerUserDetails,
  caseManagerIsNotApplicant,
}: RequiredQuestionResponses) => {
  ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockImplementation(
    // eslint-disable-next-line consistent-return
    (_application: Application, _Page: unknown, question: string) => {
      if (question === 'postcodeArea') {
        return postcodeArea
      }

      if (question === 'type') {
        return type
      }

      if (question === 'sentenceType') {
        return sentenceType
      }

      if (question === 'releaseType') {
        return releaseType
      }

      if (question === 'alternativeRadius') {
        return alternativeRadius
      }

      if (question === 'duration') {
        return duration
      }

      if (question === 'situation') {
        return situation
      }

      if (question === 'area') return apAreaId
    },
  )
  ;(applicantAndCaseManagerDetails as jest.MockedFn<typeof applicantAndCaseManagerDetails>).mockReturnValue({
    applicantUserDetails,
    caseManagerUserDetails,
    caseManagerIsNotApplicant,
  })
}

export const mockOptionalQuestionResponse = ({
  releaseType,
  alternativeRadius,
  duration,
  type,
  postcodeArea,
  sentenceType,
  isExceptionalCase,
  shouldPersonBePlacedInMaleAp,
  agreedCaseWithManager,
  lengthOfStay,
  cruInformation,
  pssDate,
  situation,
  apAreaId,
  applicantUserDetails,
  caseManagerUserDetails,
  caseManagerIsNotApplicant,
}: {
  releaseType?: string
  duration?: string
  alternativeRadius?: string
  type?: string
  postcodeArea?: string
  sentenceType?: string
  isExceptionalCase?: string
  shouldPersonBePlacedInMaleAp?: string
  agreedCaseWithManager?: string
  lengthOfStay?: string
  cruInformation?: string
  pssDate?: string
  situation?: string
  apAreaId?: string
  applicantUserDetails?: UserDetails
  caseManagerUserDetails?: UserDetails
  caseManagerIsNotApplicant?: boolean
}) => {
  ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockImplementation(
    // eslint-disable-next-line consistent-return
    (_application: Application, _Page: unknown, question: string) => {
      if (question === 'alternativeRadius') {
        return alternativeRadius
      }

      if (question === 'duration') {
        return duration
      }

      if (question === 'releaseType') {
        return releaseType
      }

      if (question === 'type') {
        return type
      }

      if (question === 'postcodeArea') {
        return postcodeArea
      }

      if (question === 'sentenceType') {
        return sentenceType
      }

      if (question === 'isExceptionalCase') {
        return isExceptionalCase
      }

      if (question === 'shouldPersonBePlacedInMaleAp') {
        return shouldPersonBePlacedInMaleAp
      }

      if (question === 'agreedCaseWithManager') {
        return agreedCaseWithManager
      }

      if (question === 'lengthOfStay') {
        return lengthOfStay
      }

      if (question === 'cruInformation') {
        return cruInformation
      }

      if (question === 'pssDate') {
        return pssDate
      }

      if (question === 'situation') {
        return situation
      }

      if (question === 'area') {
        return apAreaId
      }
    },
  )
  ;(applicantAndCaseManagerDetails as jest.MockedFn<typeof applicantAndCaseManagerDetails>).mockReturnValue({
    applicantUserDetails,
    caseManagerUserDetails,
    caseManagerIsNotApplicant,
  })
}
