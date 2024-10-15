import Pregnancy, { PregnancyBody } from './pregnancy'
import { DateFormats } from '../../../../utils/dateUtils'

describe('AccessNeeds', () => {
  const expectedDeliveryDate = new Date(2023, 1, 19)
  const body: PregnancyBody = {
    expectedDeliveryDate: DateFormats.dateObjToIsoDate(expectedDeliveryDate),
    ...DateFormats.dateObjectToDateInputs(expectedDeliveryDate, 'expectedDeliveryDate'),
    otherPregnancyConsiderations: 'yes',
    otherPregnancyConsiderationsDetail: 'Some detail',
    socialCareInvolvement: 'yes',
    socialCareInvolvementDetail: 'Some detail',
    childRemoved: 'no',
  }

  describe('title', () => {
    it('should return the title', () => {
      expect(new Pregnancy({}).title).toBe('Access, cultural and healthcare needs')
    })
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new Pregnancy(body)

      expect(page.body).toEqual({
        expectedDeliveryDate: DateFormats.dateObjToIsoDate(expectedDeliveryDate),
        'expectedDeliveryDate-year': '2023',
        'expectedDeliveryDate-month': '2',
        'expectedDeliveryDate-day': '19',
        otherPregnancyConsiderations: 'yes',
        otherPregnancyConsiderationsDetail: 'Some detail',
        socialCareInvolvement: 'yes',
        socialCareInvolvementDetail: 'Some detail',
        childRemoved: 'no',
      })
    })
  })

  describe('next', () => {
    it('returns the correct next page', () => {
      expect(new Pregnancy({}).next()).toBe('access-needs-additional-details')
    })
  })

  describe('previous', () => {
    it('returns the correct previous page', () => {
      expect(new Pregnancy({}).previous()).toBe('access-needs-further-questions')
    })
  })

  describe('errors', () => {
    it('should return errors if there are no responses to expectedDeliveryDate or childRemoved question', () => {
      const page = new Pregnancy({
        expectedDeliveryDate: undefined,
        'expectedDeliveryDate-year': undefined,
        'expectedDeliveryDate-month': undefined,
        'expectedDeliveryDate-day': undefined,
        childRemoved: undefined,
        socialCareInvolvement: undefined,
      })

      expect(page.errors()).toEqual({
        expectedDeliveryDate: 'You must enter the expected delivery date',
        childRemoved: 'You must confirm if the child will be removed at birth',
        socialCareInvolvement: 'You must confirm if there is social care involvement',
      })
    })

    it('should return a socialCareInvolvementDetail error if socialCareInvolvement is yes and socialCareInvolvementDetail is blank', () => {
      const page = new Pregnancy({
        ...body,
        socialCareInvolvement: 'yes',
        socialCareInvolvementDetail: undefined,
      })

      expect(page.errors()).toEqual({
        socialCareInvolvementDetail: 'You must provide details of any social care involvement',
      })
    })
  })

  describe('response', () => {
    it('returns the correct plain english responses for the questions', () => {
      const page = new Pregnancy(body)

      expect(page.response()).toEqual({
        'What is their expected date of delivery?': DateFormats.dateAndTimeInputsToUiDate(body, 'expectedDeliveryDate'),
        'Is there social care involvement?': 'Yes - Some detail',
        "Will the child be removed from the person's care at birth?": 'No',
        'Are there any pregnancy related issues relevant to placement?': 'Yes - Some detail',
      })
    })
  })
})
