import { fromPartial } from '@total-typescript/shoehorn'
import { YesOrNo } from '@approved-premises/ui'
import AccessNeedsFurtherQuestions, { AccessNeedsFurtherQuestionsBody } from './accessNeedsFurtherQuestions'

import { applicationFactory } from '../../../../testutils/factories'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')

describe('AccessNeedsFurtherQuestions', () => {
  const application = applicationFactory.build()

  const body: AccessNeedsFurtherQuestionsBody = {
    needsWheelchair: 'yes',
    healthConditions: 'yes',
    healthConditionsDetail: 'Some detail',
    prescribedMedication: 'yes',
    prescribedMedicationDetail: 'Some detail',
    isPersonPregnant: 'yes',
  }

  beforeEach(() => {
    ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue([])
  })

  describe('title', () => {
    it('should return the title', () => {
      expect(new AccessNeedsFurtherQuestions({}, application).title).toBe('Access, cultural and healthcare needs')
    })
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new AccessNeedsFurtherQuestions(body, application)

      expect(page.body).toEqual({
        needsWheelchair: 'yes',
        healthConditions: 'yes',
        healthConditionsDetail: 'Some detail',
        prescribedMedication: 'yes',
        prescribedMedicationDetail: 'Some detail',
        isPersonPregnant: 'yes',
      })
    })
  })

  describe('next', () => {
    describe('if the person is pregnant', () => {
      const bodyPregnancyYes = { ...body }

      it('returns the pregnancy page', () => {
        expect(new AccessNeedsFurtherQuestions(bodyPregnancyYes, application).next()).toBe('pregnancy')
      })
    })

    describe('if the person is not pregnant', () => {
      const bodyPregnancyNo = { ...body, isPersonPregnant: 'no' as YesOrNo }

      it('returns the Access Needs Additional Details page', () => {
        expect(new AccessNeedsFurtherQuestions(bodyPregnancyNo, application).next()).toBe(
          'access-needs-additional-details',
        )
      })
    })
  })

  describe('previous', () => {
    it('returns the correct previous page', () => {
      expect(new AccessNeedsFurtherQuestions({}, application).previous()).toBe('access-needs')
    })
  })

  describe('errors', () => {
    it('should return errors if there are no responses to needsWheelchair question', () => {
      const page = new AccessNeedsFurtherQuestions({ ...body, needsWheelchair: undefined }, application)

      expect(page.errors()).toEqual({
        needsWheelchair: 'You must confirm the need for a wheelchair',
      })
    })

    it('should return errors if there is no response to the healthConditions question', () => {
      const page = new AccessNeedsFurtherQuestions({ ...body, healthConditions: undefined }, application)

      expect(page.errors()).toEqual({
        healthConditions: `You must specify if the person has any known health conditions`,
      })
    })

    it('should return errors if the person answers "yes" to the healthConditions question but does not provide details', () => {
      const page = new AccessNeedsFurtherQuestions(
        { ...body, healthConditions: 'yes', healthConditionsDetail: undefined },
        application,
      )
      expect(page.errors()).toEqual({
        healthConditionsDetail: `You must provide details of the person's health conditions`,
      })
    })

    it('should return errors if the person answered "yes" to pregnancy healthcare questions but doesnt respond to pregnancy question', () => {
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue(['pregnancy'])

      const page = new AccessNeedsFurtherQuestions({ ...body, isPersonPregnant: undefined }, application)
      expect(page.errors()).toEqual({
        isPersonPregnant: `You must confirm if the person is pregnant`,
      })
    })
  })

  describe('response', () => {
    it('returns the correct plain english responses for the questions', () => {
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue(['pregnancy'])

      const page = new AccessNeedsFurtherQuestions(body, application)

      expect(page.response()).toEqual({
        'Does the person require the use of a wheelchair?': 'Yes',
        'Does the person have any known health conditions?': 'Yes - Some detail',
        'Does the person have any prescribed medication?': 'Yes - Some detail',
        'Is the person pregnant?': 'Yes',
      })
    })

    it('returns the correct plain english responses when the user responds that the person is not pregnant', () => {
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue(['mobility'])

      const page = new AccessNeedsFurtherQuestions(fromPartial({ ...body, isPersonPregnant: 'no' }), application)

      expect(page.response()).toEqual({
        'Does the person require the use of a wheelchair?': 'Yes',
        'Does the person have any known health conditions?': 'Yes - Some detail',
        'Does the person have any prescribed medication?': 'Yes - Some detail',
      })
    })
  })
})
