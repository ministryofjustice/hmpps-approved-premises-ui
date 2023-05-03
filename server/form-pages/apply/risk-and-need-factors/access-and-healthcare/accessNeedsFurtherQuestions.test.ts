import { fromPartial } from '@total-typescript/shoehorn'
import AccessNeedsFurtherQuestions, { AccessNeedsFurtherQuestionsBody } from './accessNeedsFurtherQuestions'

import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { DateFormats } from '../../../../utils/dateUtils'
import { retrieveOptionalQuestionResponseFromApplicationOrAssessment } from '../../../../utils/retrieveQuestionResponseFromApplicationOrAssessment'

jest.mock('../../../../utils/retrieveQuestionResponseFromApplicationOrAssessment')

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
  beforeEach(() => {
    ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue([''])
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

  describe('next', () => {
    it('returns the correct next page', () => {
      expect(new AccessNeedsFurtherQuestions({}, application).next()).toBe('covid')
    })
  })

  describe('previous', () => {
    it('returns the correct previous page', () => {
      expect(new AccessNeedsFurtherQuestions({}, application).previous()).toBe('access-needs')
    })
  })

  describe('errors', () => {
    it('should return errors if there are no responses to needsWheelchair question', () => {
      ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue([])
      const page = new AccessNeedsFurtherQuestions({}, application)

      expect(page.errors()).toEqual({
        needsWheelchair: 'You must confirm the need for a wheelchair',
      })
    })

    it('should return errors if the person answered "yes" to pregancy healthcare questions but doesnt respond to pregnacny question', () => {
      ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue(['pregnancy'])

      const page = new AccessNeedsFurtherQuestions({ needsWheelchair: 'no' }, application)
      expect(page.errors()).toEqual({
        isPersonPregnant: 'You must confirm if the person is pregnant',
      })
    })

    it('should return errors if there are no responses to expectedDeliveryDate or childRemoved question and isPersonPregnant is yes', () => {
      ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue(['pregnancy'])

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
      ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue(['pregnancy'])

      const page = new AccessNeedsFurtherQuestions(body, application)

      expect(page.response()).toEqual({
        'Visual Impairment': 'visual impairment',
        'Are there any other considerations': 'none',
        'Mobility needs': 'mobility needs',
        'Is this person pregnant?': 'Yes',
        'Does John Wayne require the use of a wheelchair?': 'Yes',
        'What is their expected date of delivery?': 'Sunday 19 February 2023',
        'Will the child be removed at birth?': 'No',
      })
    })

    it('returns the correct plain english responses when the user responds that the person is not pregnant', () => {
      ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue(['pregnancy'])

      const page = new AccessNeedsFurtherQuestions(fromPartial({ ...body, isPersonPregnant: 'no' }), application)

      expect(page.response()).toEqual({
        'Visual Impairment': 'visual impairment',
        'Does John Wayne require the use of a wheelchair?': 'Yes',
        'Mobility needs': 'mobility needs',
        'Is this person pregnant?': 'No',
      })
    })
  })
})
