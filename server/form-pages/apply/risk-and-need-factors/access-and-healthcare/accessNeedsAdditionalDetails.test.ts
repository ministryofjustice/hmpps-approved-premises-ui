import { when } from 'jest-when'
import { applicationFactory } from '../../../../testutils/factories'
import AccessNeedsAdditionalDetails, { AccessNeedsAdditionalDetailsBody } from './accessNeedsAdditionalDetails'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import AccessNeeds from './accessNeeds'
import AccessNeedsFurtherQuestions from './accessNeedsFurtherQuestions'

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')

describe('AccessNeedsAdditionalDetails', () => {
  const application = applicationFactory.build()

  const body: AccessNeedsAdditionalDetailsBody = {
    additionalAdjustments: 'Adjustments',
  }

  beforeEach(() => {
    when(retrieveOptionalQuestionResponseFromFormArtifact)
      .calledWith(application, AccessNeeds, 'additionalNeeds')
      .mockReturnValue([])
    when(retrieveOptionalQuestionResponseFromFormArtifact)
      .calledWith(application, AccessNeedsFurtherQuestions, 'isPersonPregnant')
      .mockReturnValue('yes')
  })

  describe('title', () => {
    it('should return the title', () => {
      expect(new AccessNeedsAdditionalDetails({}, application).title).toBe('Access, cultural and healthcare needs')
    })
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new AccessNeedsAdditionalDetails(body, application)

      expect(page.body).toEqual({
        additionalAdjustments: 'Adjustments',
      })
    })
  })

  describe('next', () => {
    it('returns the correct next page', () => {
      expect(new AccessNeedsAdditionalDetails({}, application).next()).toBe('covid')
    })
  })

  describe('previous', () => {
    describe('if the person is pregnant', () => {
      it('returns the pregnancy page', () => {
        expect(new AccessNeedsAdditionalDetails(body, application).previous()).toBe('pregnancy')
      })
    })

    describe('if the person is not pregnant', () => {
      beforeEach(() => {
        when(retrieveOptionalQuestionResponseFromFormArtifact)
          .calledWith(application, AccessNeedsFurtherQuestions, 'isPersonPregnant')
          .mockReturnValue('no')
      })

      it('returns the Access Needs Further Questions page', () => {
        expect(new AccessNeedsAdditionalDetails(body, application).previous()).toBe('access-needs-further-questions')
      })
    })

    describe('if the question about pregnancy was not asked', () => {
      beforeEach(() => {
        when(retrieveOptionalQuestionResponseFromFormArtifact)
          .calledWith(application, AccessNeedsFurtherQuestions, 'isPersonPregnant')
          .mockReturnValue(undefined)
      })

      it('returns the Access Needs Further Questions page', () => {
        expect(new AccessNeedsAdditionalDetails(body, application).previous()).toBe('access-needs-further-questions')
      })
    })
  })

  describe('errors', () => {
    it('should not require an answer for additional details', () => {
      expect(new AccessNeedsAdditionalDetails({}, application).errors()).toEqual({})
    })
  })

  describe('listOfNeeds', () => {
    it('should return null when no needs are selected', () => {
      const page = new AccessNeedsAdditionalDetails(body, application)

      expect(page.listOfNeeds).toEqual(null)
    })

    it('should return a single need when one is selected', () => {
      when(retrieveOptionalQuestionResponseFromFormArtifact)
        .calledWith(application, AccessNeeds, 'additionalNeeds')
        .mockReturnValue(['mobility'])

      const page = new AccessNeedsAdditionalDetails(body, application)

      expect(page.listOfNeeds).toEqual('mobility needs')
    })

    it('should return a list of needs', () => {
      when(retrieveOptionalQuestionResponseFromFormArtifact)
        .calledWith(application, AccessNeeds, 'additionalNeeds')
        .mockReturnValue(['learningDisability', 'neurodivergentConditions', 'healthcare'])

      const page = new AccessNeedsAdditionalDetails(body, application)

      expect(page.listOfNeeds).toEqual('learning disability, neurodivergent conditions or healthcare needs')
    })
  })

  describe('response', () => {
    it('returns the correct plain english response for the question', () => {
      when(retrieveOptionalQuestionResponseFromFormArtifact)
        .calledWith(application, AccessNeeds, 'additionalNeeds')
        .mockReturnValue(['mobility', 'pregnancy'])

      const page = new AccessNeedsAdditionalDetails(body, application)

      expect(page.response()).toEqual({
        "Specify any additional details and adjustments required for the person's mobility or pregnancy needs":
          'Adjustments',
      })
    })
  })
})
