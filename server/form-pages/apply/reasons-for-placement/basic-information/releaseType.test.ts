import { applicationFactory } from '../../../../testutils/factories'

import ReleaseType from './releaseType'

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact', () => {
  return { retrieveQuestionResponseFromFormArtifact: jest.fn(() => 'standardDeterminate') }
})

describe('ReleaseType', () => {
  const application = applicationFactory.build({
    data: { 'basic-information': { 'sentence-type': { sentenceType: 'standardDeterminate' } } },
  })

  describe('items', () => {
    it('marks an option as selected when the releaseType is set', () => {
      const page = new ReleaseType({ releaseType: 'rotl' }, application)

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(1)
      expect(selectedOptions[0].value).toEqual('rotl')
    })

    it('marks no options as selected when the releaseType is not set', () => {
      const page = new ReleaseType({}, application)

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(0)
    })
  })
})
