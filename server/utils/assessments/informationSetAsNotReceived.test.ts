import { applicationFactory, assessmentFactory } from '../../testutils/factories'
import informationSetAsNotReceived from './informationSetAsNotReceived'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'

jest.mock('../retrieveQuestionResponseFromFormArtifact')

describe('informationSetAsNotReceived', () => {
  const assessment = assessmentFactory.build()

  it('returns false when there is no data', () => {
    assessment.data = {}

    expect(informationSetAsNotReceived(assessment)).toEqual(false)
  })

  it('returns false when informationReceived is set to yes', () => {
    ;(
      retrieveOptionalQuestionResponseFromFormArtifact as jest.MockedFn<
        typeof retrieveOptionalQuestionResponseFromFormArtifact
      >
    ).mockReturnValue('yes')

    expect(informationSetAsNotReceived(assessment)).toEqual(false)
  })

  it('returns true when informationReceived is set to no', () => {
    ;(
      retrieveOptionalQuestionResponseFromFormArtifact as jest.MockedFn<
        typeof retrieveOptionalQuestionResponseFromFormArtifact
      >
    ).mockReturnValue('no')

    expect(informationSetAsNotReceived(assessment)).toEqual(true)
  })

  it('returns false when the argument is an Application', () => {
    const application = applicationFactory.build()

    expect(informationSetAsNotReceived(application)).toEqual(false)
  })
})
