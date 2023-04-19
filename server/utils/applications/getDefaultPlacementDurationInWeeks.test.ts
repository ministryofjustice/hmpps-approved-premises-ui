import { applicationFactory } from '../../testutils/factories'
import { retrieveQuestionResponseFromApplicationOrAssessment } from '../retrieveQuestionResponseFromApplicationOrAssessment'
import { getDefaultPlacementDurationInWeeks } from './getDefaultPlacementDurationInWeeks'

jest.mock('../retrieveQuestionResponseFromApplicationOrAssessment.ts')

describe('getDefaultPlacementDurationInWeeks', () => {
  const application = applicationFactory.build()

  it('returns 12 weeks if the ap type is standard', () => {
    ;(retrieveQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValueOnce('standard')

    expect(getDefaultPlacementDurationInWeeks(application)).toEqual(12)
  })

  it('returns 26 weeks if the ap type is standard', () => {
    ;(retrieveQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValueOnce('pipe')

    expect(getDefaultPlacementDurationInWeeks(application)).toEqual(26)
  })

  it('returns 56 weeks if the ap type is standard', () => {
    ;(retrieveQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValueOnce('esap')

    expect(getDefaultPlacementDurationInWeeks(application)).toEqual(56)
  })
})
