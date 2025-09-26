import { itShouldHaveNextValue } from '../../shared/index'

import Situation from './situation'
import { placementApplicationFactory } from '../../../testutils/factories'

jest.mock('../../../utils/retrieveQuestionResponseFromFormArtifact', () => {
  return { retrieveQuestionResponseFromFormArtifact: jest.fn(() => 'communityOrder') }
})

describe('Situation', () => {
  const placementApplication = placementApplicationFactory.build({})
  const situationPage = new Situation({}, placementApplication)
  itShouldHaveNextValue(situationPage, 'additional-placement-details')

  it('should retrieve the sentence type', () => {
    expect(situationPage.sentenceType).toEqual('communityOrder')
  })
})
