import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import AccessNeedsFurtherQuestions, { AccessNeedsFurtherQuestionsBody } from './accessNeedsFurtherQuestions'

import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { DateFormats } from '../../../../utils/dateUtils'

jest.mock('../../../../utils/retrieveQuestionResponseFromApplicationOrAssessment', () => {
  return {
    retrieveOptionalQuestionResponseFromApplicationOrAssessment: jest.fn(() => ['pregnancy']),
  }
})

describe('AccessNeedsFurtherQuestions', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  const expectedDeliveryDate = new Date(2023, 1, 19)
  const body: AccessNeedsFurtherQuestionsBody = {
    needsWheelchair: 'yes',
    mobilityNeeds: 'mobility needs',
    visualImpairment: 'visual impairment',
    expectedDeliveryDate: DateFormats.dateObjToIsoDate(expectedDeliveryDate),
    ...DateFormats.dateObjectToDateInputs(expectedDeliveryDate, 'expectedDeliveryDate'),
    otherPregnancyConsiderations: 'none',
    childRemoved: 'no',
    isPersonPregnant: 'yes',
  }

  describe('title', () => {
    expect(new AccessNeedsFurtherQuestions({}, application).title).toBe('Access, cultural and healthcare needs')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new AccessNeedsFurtherQuestions(body, application)
      expect(page.body).toEqual({
        needsWheelchair: 'yes',
        visualImpairment: 'visual impairment',
        mobilityNeeds: 'mobility needs',
        isPersonPregnant: 'yes',
        expectedDeliveryDate: DateFormats.dateObjToIsoDate(expectedDeliveryDate),
        'expectedDeliveryDate-year': '2023',
        'expectedDeliveryDate-month': '2',
        'expectedDeliveryDate-day': '19',
        otherPregnancyConsiderations: 'none',
        childRemoved: 'no',
      })
    })
  })

  itShouldHaveNextValue(new AccessNeedsFurtherQuestions({}, application), 'covid')
  itShouldHavePreviousValue(new AccessNeedsFurtherQuestions({}, application), 'access-needs')

  describe('errors', () => {
    it('should return errors if there are no responses to needsWheelchair or isPersonPregnant questions', () => {
      const page = new AccessNeedsFurtherQuestions({}, application)
      expect(page.errors()).toEqual({
        needsWheelchair: 'You must confirm the need for a wheelchair',
        isPersonPregnant: 'You must confirm if the person is pregnant',
      })
    })
    it('if isPersonIsPregnant is yes, should return errors if there are no responses to expectedDeliveryDate or childRemoved questions', () => {
      const page = new AccessNeedsFurtherQuestions({ isPersonPregnant: 'yes' }, application)
      expect(page.errors()).toEqual({
        needsWheelchair: 'You must confirm the need for a wheelchair',
        expectedDeliveryDate: 'You must enter the expected delivery date',
        childRemoved: 'You must confirm if the child will be removed at birth',
      })
    })
  })

  describe('response', () => {
    it('returns the correct plain english responses for the questions', () => {
      const page = new AccessNeedsFurtherQuestions(body, application)

      expect(page.response()).toEqual({
        'Visual Impairment': 'visual impairment',
        'Are there any other considerations': 'none',
        'Does John Wayne require a wheelchair accessible room?': 'Yes',
        'Mobility needs': 'mobility needs',
        'Is this person pregnant?': 'Yes',
        'What is their expected date of delivery?': 'Sunday 19 February 2023',
        'Will the child be removed at birth?': 'No',
      })
    })
  })
})
