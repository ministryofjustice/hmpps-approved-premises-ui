import { applicationFactory } from '../../testutils/factories'
import { retrieveQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import { getDefaultPlacementDurationInDays } from './getDefaultPlacementDurationInDays'

jest.mock('../retrieveQuestionResponseFromFormArtifact.ts')

describe('getDefaultPlacementDurationInDays', () => {
  const application = applicationFactory.build()

  it('returns 12 weeks if the ap type is standard', () => {
    ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValueOnce('standard')

    expect(getDefaultPlacementDurationInDays(application)).toEqual(12 * 7)
  })

  it('returns 26 weeks if the ap type is standard', () => {
    ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValueOnce('pipe')

    expect(getDefaultPlacementDurationInDays(application)).toEqual(26 * 7)
  })

  it('returns 56 weeks if the ap type is standard', () => {
    ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValueOnce('esap')

    expect(getDefaultPlacementDurationInDays(application)).toEqual(52 * 7)
  })
})
