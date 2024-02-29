import { fromPartial } from '@total-typescript/shoehorn'
import AccessNeedsFurtherQuestions, { AccessNeedsFurtherQuestionsBody } from './accessNeedsFurtherQuestions'

import { applicationFactory } from '../../../../testutils/factories'
import { DateFormats } from '../../../../utils/dateUtils'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')

describe('AccessNeedsFurtherQuestions', () => {
  const application = applicationFactory.build()

  const expectedDeliveryDate = new Date(2023, 1, 19)
  const body: AccessNeedsFurtherQuestionsBody = {
    needsWheelchair: 'yes',
    healthConditions: 'yes',
    healthConditionsDetail: 'Some detail',
    prescribedMedication: 'yes',
    prescribedMedicationDetail: 'Some detail',
    expectedDeliveryDate: DateFormats.dateObjToIsoDate(expectedDeliveryDate),
    ...DateFormats.dateObjectToDateInputs(expectedDeliveryDate, 'expectedDeliveryDate'),
    otherPregnancyConsiderations: 'yes',
    otherPregnancyConsiderationsDetail: 'Some detail',
    socialCareInvolvement: 'yes',
    socialCareInvolvementDetail: 'Some detail',
    childRemoved: 'no',
    isPersonPregnant: 'yes',
    additionalAdjustments: 'Adjustments',
  }

  beforeEach(() => {
    ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue([''])
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
        expectedDeliveryDate: DateFormats.dateObjToIsoDate(expectedDeliveryDate),
        'expectedDeliveryDate-year': '2023',
        'expectedDeliveryDate-month': '2',
        'expectedDeliveryDate-day': '19',
        otherPregnancyConsiderations: 'yes',
        otherPregnancyConsiderationsDetail: 'Some detail',
        socialCareInvolvement: 'yes',
        socialCareInvolvementDetail: 'Some detail',
        childRemoved: 'no',
        additionalAdjustments: 'Adjustments',
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
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue([])

      const page = new AccessNeedsFurtherQuestions({ ...body, needsWheelchair: undefined }, application)

      expect(page.errors()).toEqual({
        needsWheelchair: 'You must confirm the need for a wheelchair',
      })
    })

    it('should return errors if there is no response to the healthConditions question', () => {
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue([])
      const page = new AccessNeedsFurtherQuestions({ ...body, healthConditions: undefined }, application)

      expect(page.errors()).toEqual({
        healthConditions: `You must specify if the person has any known health conditions`,
      })
    })

    it('should return errors if the person answers "yes" to the healthConditions question but does not provide details', () => {
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue([])

      const page = new AccessNeedsFurtherQuestions(
        { ...body, healthConditions: 'yes', healthConditionsDetail: undefined },
        application,
      )
      expect(page.errors()).toEqual({
        healthConditionsDetail: `You must provide details of the person's health conditions`,
      })
    })

    it('should return errors if the person answered "yes" to pregancy healthcare questions but doesnt respond to pregnancy question', () => {
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue(['pregnancy'])

      const page = new AccessNeedsFurtherQuestions({ ...body, isPersonPregnant: undefined }, application)
      expect(page.errors()).toEqual({
        isPersonPregnant: `You must confirm if the person is pregnant`,
      })
    })

    it('should return errors if there are no responses to expectedDeliveryDate or childRemoved question and isPersonPregnant is yes', () => {
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue(['pregnancy'])

      const page = new AccessNeedsFurtherQuestions(
        {
          ...body,
          isPersonPregnant: 'yes',
          expectedDeliveryDate: undefined,
          'expectedDeliveryDate-year': undefined,
          'expectedDeliveryDate-month': undefined,
          'expectedDeliveryDate-day': undefined,
          childRemoved: undefined,
          socialCareInvolvement: undefined,
        },
        application,
      )
      expect(page.errors()).toEqual({
        expectedDeliveryDate: 'You must enter the expected delivery date',
        childRemoved: 'You must confirm if the child will be removed at birth',
        socialCareInvolvement: 'You must confirm if there is social care involvement',
      })
    })

    it('should return a socialCareInvolvementDetail error if the person is pregnant and socialCareInvolvement is yes and socialCareInvolvementDetail is blank', () => {
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue(['pregnancy'])

      const page = new AccessNeedsFurtherQuestions(
        {
          ...body,
          isPersonPregnant: 'yes',
          socialCareInvolvement: 'yes',
          socialCareInvolvementDetail: undefined,
        },
        application,
      )
      expect(page.errors()).toEqual({
        socialCareInvolvementDetail: 'You must provide details of any social care involvement',
      })
    })
  })

  describe('listOfNeeds', () => {
    it('should return null when no needs are selected', () => {
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue([])

      const page = new AccessNeedsFurtherQuestions(body, application)

      expect(page.listOfNeeds).toEqual(null)
    })

    it('should return a single need when one is selected', () => {
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue(['mobility'])

      const page = new AccessNeedsFurtherQuestions(body, application)

      expect(page.listOfNeeds).toEqual('mobility needs')
    })

    it('should return a list of needs', () => {
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue([
        'learningDisability',
        'neurodivergentConditions',
        'healthcare',
      ])

      const page = new AccessNeedsFurtherQuestions(body, application)

      expect(page.listOfNeeds).toEqual('learning disability, neurodivergent conditions or healthcare needs')
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
        'Is there social care involvement?': 'Yes - Some detail',
        'What is their expected date of delivery?': DateFormats.dateAndTimeInputsToUiDate(body, 'expectedDeliveryDate'),
        "Will the child be removed from the person's care at birth?": 'No',
        'Are there any pregnancy related issues relevant to placement?': 'Yes - Some detail',
        "Specify any additional details and adjustments required for the person's pregnancy needs": 'Adjustments',
      })
    })

    it('returns the correct plain english responses when the user responds that the person is not pregnant', () => {
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue(['mobility'])

      const page = new AccessNeedsFurtherQuestions(fromPartial({ ...body, isPersonPregnant: 'no' }), application)

      expect(page.response()).toEqual({
        'Does the person require the use of a wheelchair?': 'Yes',
        'Does the person have any known health conditions?': 'Yes - Some detail',
        'Does the person have any prescribed medication?': 'Yes - Some detail',
        "Specify any additional details and adjustments required for the person's mobility needs": 'Adjustments',
      })
    })
  })
})
