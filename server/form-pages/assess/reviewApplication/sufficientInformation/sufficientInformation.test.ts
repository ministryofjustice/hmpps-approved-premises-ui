import { when } from 'jest-when'
import { itShouldHavePreviousValue } from '../../../shared'

import SufficientInformation from './sufficientInformation'
import { assessmentFactory } from '../../../../testutils/factories'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')

describe('SufficientInformation', () => {
  const assessment = assessmentFactory.build()

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('title', () => {
    expect(new SufficientInformation({}, assessment).title).toBe(
      'Is there enough information in the application for you to make a decision?',
    )
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new SufficientInformation({ sufficientInformation: 'yes' }, assessment)
      expect(page.body).toEqual({ sufficientInformation: 'yes' })
    })
  })

  describe('next', () => {
    describe('when sufficientInformation is yes', () => {
      expect(new SufficientInformation({ sufficientInformation: 'yes' }, assessment).next()).toBe('')
    })

    describe('when sufficientInformation is no', () => {
      describe('if the information has been previously requested', () => {
        when(retrieveOptionalQuestionResponseFromFormArtifact)
          .calledWith(assessment, SufficientInformation, 'sufficientInformation')
          .mockReturnValue('no')

        expect(new SufficientInformation({ sufficientInformation: 'no' }, assessment).next()).toBe(
          'information-received',
        )
      })
    })

    describe('if dontShowConfirmationPage is false', () => {
      when(retrieveOptionalQuestionResponseFromFormArtifact)
        .calledWith(assessment, SufficientInformation, 'sufficientInformation')
        .mockReturnValue(undefined)

      const page = new SufficientInformation({ sufficientInformation: 'no' }, assessment)
      page.dontShowConfirmationPage = false

      expect(page.next()).toBe('sufficient-information-confirm')
    })

    describe('if dontShowConfirmationPage is true', () => {
      const page = new SufficientInformation({ sufficientInformation: 'no' }, assessment)
      page.dontShowConfirmationPage = true

      expect(page.next()).toBe('sufficient-information-sent')
    })
  })

  itShouldHavePreviousValue(new SufficientInformation({}, assessment), 'dashboard')

  describe('errors', () => {
    it('should have an error if there is no answer', () => {
      const page = new SufficientInformation({}, assessment)

      expect(page.errors()).toEqual({
        sufficientInformation: 'You must confirm if there is enough information in the application to make a decision',
      })
    })

    it('should have an error if the answer is no and no query is specified', () => {
      const page = new SufficientInformation({ sufficientInformation: 'no' }, assessment)

      expect(page.errors()).toEqual({
        query: 'You must specify what additional information is needed',
      })
    })
  })

  describe('response', () => {
    it('returns the sufficientInformation response when the answer is yes and an empty string for the query', () => {
      const page = new SufficientInformation({ sufficientInformation: 'yes' }, assessment)

      expect(page.response()).toEqual({
        'Is there enough information in the application for you to make a decision?': 'Yes',
        'What additional information is needed?': '',
      })
    })

    it('returns both responses when the answer is no', () => {
      const page = new SufficientInformation({ sufficientInformation: 'no', query: 'some query' }, assessment)

      expect(page.response()).toEqual({
        'Is there enough information in the application for you to make a decision?': 'No',
        'What additional information is needed?': 'some query',
      })
    })
  })
})
