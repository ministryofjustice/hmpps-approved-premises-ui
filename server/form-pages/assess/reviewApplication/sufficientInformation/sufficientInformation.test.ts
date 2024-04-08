import { fromPartial } from '@total-typescript/shoehorn'
import { when } from 'jest-when'
import { createMock } from '@golevelup/ts-jest'
import { AssessmentService, FeatureFlagService } from '../../../../services'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import SufficientInformation, { Body } from './sufficientInformation'
import { assessmentFactory } from '../../../../testutils/factories'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')

describe('SufficientInformation', () => {
  const assessment = assessmentFactory.build()
  const featureFlagService = createMock<FeatureFlagService>({})
  const featureFlags = {}
  const assessmentService = createMock<AssessmentService>({})
  const query = 'some text'

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('title', () => {
    expect(new SufficientInformation({}, assessment, featureFlags).title).toBe(
      'Is there enough information in the application for you to make a decision?',
    )
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new SufficientInformation({ sufficientInformation: 'yes' }, assessment, featureFlags)
      expect(page.body).toEqual({ sufficientInformation: 'yes' })
    })
  })

  describe('initialize', () => {
    beforeEach(() => {
      when(featureFlagService.getBooleanFlag)
        .calledWith('allow-sufficient-information-request-without-confirmation')
        .mockResolvedValue(true)
    })

    it('calls the featueFlagService and adds the response to the body', async () => {
      const featureFlagValue = true

      const page = await SufficientInformation.initialize(
        { sufficientInformation: 'yes' },
        null,
        null,
        fromPartial({
          featureFlagService,
        }),
      )

      expect(page.dontShowConfirmationPage).toBe(featureFlagValue)
      expect(featureFlagService.getBooleanFlag).toHaveBeenCalledWith(
        'allow-sufficient-information-request-without-confirmation',
      )
    })

    it('should initialize the page and not create a note when the body is not present', async () => {
      const body: Body = {}
      const page = await SufficientInformation.initialize(
        body,
        assessment,
        'token',
        fromPartial({ assessmentService, featureFlagService }),
      )

      expect(page.body).toEqual(body)
      expect(assessmentService.createClarificationNote).not.toHaveBeenCalled()
    })

    it('should initialize the page and not create a note when sufficient information is yes', async () => {
      const body: Body = { sufficientInformation: 'yes' }
      const page = await SufficientInformation.initialize(
        body,
        assessment,
        'token',
        fromPartial({ assessmentService, featureFlagService }),
      )

      expect(page.body).toEqual(body)
      expect(assessmentService.createClarificationNote).not.toHaveBeenCalled()
    })

    it('should initialize the page and create a note when sufficientInformation is no and the page has not already been completed', async () => {
      const body: Body = { sufficientInformation: 'no', query }

      when(retrieveOptionalQuestionResponseFromFormArtifact)
        .calledWith(assessment, SufficientInformation, 'sufficientInformation')
        .mockReturnValue(undefined)

      const page = await SufficientInformation.initialize(
        body,
        assessment,
        'token',
        fromPartial({ assessmentService, featureFlagService }),
      )

      expect(page.body).toEqual(body)
      expect(assessmentService.createClarificationNote).toHaveBeenCalledWith('token', assessment.id, { query })
    })

    it('should initialize the page and not create a note when dontShowConfirmationPage is false', async () => {
      const body: Body = { sufficientInformation: 'no', query }

      when(featureFlagService.getBooleanFlag)
        .calledWith('allow-sufficient-information-request-without-confirmation')
        .mockResolvedValue(false)

      const page = await SufficientInformation.initialize(
        body,
        assessment,
        'token',
        fromPartial({ assessmentService, featureFlagService }),
      )

      expect(page.body).toEqual(body)
      expect(assessmentService.createClarificationNote).not.toHaveBeenCalled()
    })

    it('should initialize the page and not create a note when sufficientInformation is no and the page has already been completed', async () => {
      const body: Body = { sufficientInformation: 'no', query }

      when(retrieveOptionalQuestionResponseFromFormArtifact)
        .calledWith(assessment, SufficientInformation, 'sufficientInformation')
        .mockReturnValue('no')

      const page = await SufficientInformation.initialize(
        body,
        assessment,
        'token',
        fromPartial({ assessmentService, featureFlagService }),
      )

      expect(page.body).toEqual(body)
      expect(assessmentService.createClarificationNote).not.toHaveBeenCalled()
    })
  })

  describe('when sufficientInformation is yes', () => {
    itShouldHaveNextValue(new SufficientInformation({ sufficientInformation: 'yes' }, assessment, featureFlags), '')
  })

  describe('when sufficientInformation is no', () => {
    describe('if dontShowConfirmationPage is true', () => {
      const page = new SufficientInformation({ sufficientInformation: 'no' }, assessment, featureFlags)
      page.dontShowConfirmationPage = false
      expect(page.next()).toBe('sufficient-information-confirm')
    })

    describe('if dontShowConfirmationPage is true', () => {
      const page = new SufficientInformation({ sufficientInformation: 'no' }, assessment, featureFlags)
      page.dontShowConfirmationPage = true
      expect(page.next()).toBe('sufficient-information-sent')
    })
  })

  itShouldHavePreviousValue(new SufficientInformation({}, assessment, featureFlags), 'dashboard')

  describe('errors', () => {
    it('should have an error if there is no answer', () => {
      const page = new SufficientInformation({}, assessment, featureFlags)

      expect(page.errors()).toEqual({
        sufficientInformation: 'You must confirm if there is enough information in the application to make a decision',
      })
    })

    it('should have an error if the answer is no and no query is specified', () => {
      const page = new SufficientInformation({ sufficientInformation: 'no' }, assessment, featureFlags)

      expect(page.errors()).toEqual({
        query: 'You must specify what additional information is needed',
      })
    })
  })

  describe('response', () => {
    it('returns the sufficientInformation response when the answer is yes and an empty string for the query', () => {
      const page = new SufficientInformation({ sufficientInformation: 'yes' }, assessment, featureFlags)

      expect(page.response()).toEqual({
        'Is there enough information in the application for you to make a decision?': 'Yes',
        'What additional information is needed?': '',
      })
    })

    it('returns both responses when the answer is no', () => {
      const page = new SufficientInformation(
        { sufficientInformation: 'no', query: 'some query' },
        assessment,
        featureFlags,
      )

      expect(page.response()).toEqual({
        'Is there enough information in the application for you to make a decision?': 'No',
        'What additional information is needed?': 'some query',
      })
    })
  })
})
