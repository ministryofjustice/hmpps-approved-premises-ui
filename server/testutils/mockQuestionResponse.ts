import { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import {
  retrieveOptionalQuestionResponseFromApplicationOrAssessment,
  retrieveQuestionResponseFromApplicationOrAssessment,
} from '../utils/retrieveQuestionResponseFromApplicationOrAssessment'

export const mockQuestionResponse = ({
  postcodeArea = 'ABC 123',
  type = 'standard',
  sentenceType = 'standardDeterminate',
  releaseType = 'other',
  alternativeRadius,
  duration,
}: {
  postcodeArea?: string
  type?: string
  sentenceType?: string
  releaseType?: string
  duration?: string
  alternativeRadius?: string
}) => {
  ;(retrieveQuestionResponseFromApplicationOrAssessment as jest.Mock).mockImplementation(
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
    },
  )
}

export const mockOptionalQuestionResponse = ({
  releaseType = 'other',
  alternativeRadius,
  duration,
}: {
  releaseType?: string
  duration?: string
  alternativeRadius?: string
}) => {
  ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockImplementation(
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
    },
  )
}
