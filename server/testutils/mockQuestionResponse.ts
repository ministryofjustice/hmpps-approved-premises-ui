import { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import { retrieveQuestionResponseFromApplicationOrAssessment } from '../utils/retrieveQuestionResponseFromApplicationOrAssessment'

const mockQuestionResponse = ({
  postcodeArea = 'ABC 123',
  type = 'standard',
  sentenceType = 'standardDeterminate',
}: {
  postcodeArea?: string
  type?: string
  sentenceType?: string
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
    },
  )
}

export default mockQuestionResponse
