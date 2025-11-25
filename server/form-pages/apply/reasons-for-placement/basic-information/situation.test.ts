import { itShouldHaveNextValue } from '../../../shared/index'

import Situation from './situation'
import { applicationFactory } from '../../../../testutils/factories'

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact', () => {
  return { retrieveQuestionResponseFromFormArtifact: jest.fn(() => 'communityOrder') }
})
const application = applicationFactory.build({})

describe('Situation', () => {
  const situationPage = new Situation({}, application)

  itShouldHaveNextValue(situationPage, 'release-date')

  it('should retrieve the sentence type', () => {
    expect(situationPage.sentenceType).toEqual('communityOrder')
  })
})
