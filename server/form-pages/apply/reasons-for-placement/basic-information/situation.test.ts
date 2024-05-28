import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { applicationFactory } from '../../../../testutils/factories'
import { retrieveQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'

import Situation from './situation'

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact', () => {
  return { retrieveQuestionResponseFromFormArtifact: jest.fn(() => 'communityOrder') }
})

describe('Situation', () => {
  const application = applicationFactory.build({
    data: { 'basic-information': { 'sentence-type': { sentenceType: 'communityOrder' } } },
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new Situation({ situation: 'riskManagement' }, application)

      expect(page.body).toEqual({ situation: 'riskManagement' })
    })
  })

  itShouldHavePreviousValue(new Situation({}, application), 'sentence-type')
  itShouldHaveNextValue(new Situation({}, application), 'release-date')

  describe('errors', () => {
    it('should return an empty object if the situation is populated', () => {
      const page = new Situation({ situation: 'riskManagement' }, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an errors if the situation is not populated', () => {
      const page = new Situation({}, application)
      expect(page.errors()).toEqual({ situation: 'You must choose a situation' })
    })
  })

  describe('items', () => {
    describe('sentenceType', () => {
      it('if the sentence type is "communityOrder" then the items should be correct', () => {
        ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue('communityOrder')

        const items = new Situation({ situation: 'riskManagement' }, application).items()

        expect(items.length).toEqual(2)
        expect(items[0]).toEqual({
          text: 'Application for risk management/public protection',
          value: 'riskManagement',
          checked: true,
        })
        expect(items[1]).toEqual({
          text: 'Specified residency requirement as part of a community based Order',
          value: 'residencyManagement',
          checked: false,
        })
      })

      it('if the sentence type is "bailPlacement" then the items should be correct', () => {
        ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue('bailPlacement')

        const items = new Situation({ situation: 'bailAssessment' }, application).items()

        expect(items.length).toEqual(3)
        expect(items[0]).toEqual({
          text: 'Bail assessment for residency requirement as part of a community order or suspended sentence order',
          value: 'bailAssessment',
          checked: true,
        })
        expect(items[1]).toEqual({ text: 'Bail placement', value: 'bailSentence', checked: false })
        expect(items[2]).toEqual({ text: 'Awaiting sentence', value: 'awaitingSentence', checked: false })
      })
    })

    it('marks an option as selected when the releaseType is set', () => {
      ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue('communityOrder')

      const page = new Situation({ situation: 'riskManagement' }, application)

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(1)
      expect(selectedOptions[0].value).toEqual('riskManagement')
    })

    it('marks no options as selected when the releaseType is not set', () => {
      const page = new Situation({}, application)

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(0)
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new Situation({ situation: 'riskManagement' }, application)

      expect(page.response()).toEqual({
        [page.title]: 'Application for risk management/public protection',
      })
    })
  })
})
