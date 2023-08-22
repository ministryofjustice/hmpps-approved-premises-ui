import { fromPartial } from '@total-typescript/shoehorn'
import AccessNeedsFurtherQuestions, { AccessNeedsFurtherQuestionsBody } from './accessNeedsFurtherQuestions'

import { applicationFactory, personFactory, restrictedPersonFactory } from '../../../../testutils/factories'
import { DateFormats } from '../../../../utils/dateUtils'
import { retrieveOptionalQuestionResponseFromApplicationOrAssessment } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')

describe('AccessNeedsFurtherQuestions', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

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
    childRemoved: 'no',
    isPersonPregnant: 'yes',
    additionalAdjustments: 'Adjustments',
  }

  beforeEach(() => {
    ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue([''])
  })

  describe('title', () => {
    it('should return the title', () => {
      expect(new AccessNeedsFurtherQuestions({}, application).title).toBe('Access, cultural and healthcare needs')
    })
  })

  describe('questions', () => {
    beforeEach(() => {
      ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue(['mobility'])
    })

    it('if the applications person is a full person', () => {
      const page = new AccessNeedsFurtherQuestions(body, application)
      expect(page.questions).toEqual({
        additionalAdjustments: `Specify any additional details and adjustments required for ${person.name}'s mobility needs`,
        childRemoved: `Will the child be removed from ${person.name}'s care at birth?`,
        expectedDeliveryDate: 'What is their expected date of delivery?',
        healthConditions: `Does ${person.name} have any known health conditions?`,
        healthConditionsDetail: `Provide details`,
        isPersonPregnant: `Is ${person.name} pregnant?`,
        otherPregnancyConsiderations: `Are there any pregnancy related issues relevant to placement?`,
        otherPregnancyConsiderationsDetail: `Provide details`,
        prescribedMedication: `Does ${person.name} have any prescribed medication?`,
        prescribedMedicationDetail: `Provide details`,
        wheelchair: `Does ${person.name} require the use of a wheelchair?`,
      })
    })

    it('if the applications person is a restricted person', () => {
      const applicationWithRestrictedPerson = { ...application, person: restrictedPersonFactory.build() }
      const page = new AccessNeedsFurtherQuestions(body, applicationWithRestrictedPerson)
      expect(page.questions).toEqual({
        additionalAdjustments:
          "Specify any additional details and adjustments required for the person's mobility needs",
        childRemoved: "Will the child be removed from the person's care at birth?",
        expectedDeliveryDate: 'What is their expected date of delivery?',
        healthConditions: 'Does the person have any known health conditions?',
        healthConditionsDetail: 'Provide details',
        isPersonPregnant: 'Is the person pregnant?',
        otherPregnancyConsiderations: 'Are there any pregnancy related issues relevant to placement?',
        otherPregnancyConsiderationsDetail: 'Provide details',
        prescribedMedication: 'Does the person have any prescribed medication?',
        prescribedMedicationDetail: 'Provide details',
        wheelchair: 'Does the person require the use of a wheelchair?',
      })
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
      ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue([])

      const page = new AccessNeedsFurtherQuestions({ ...body, needsWheelchair: undefined }, application)

      expect(page.errors()).toEqual({
        needsWheelchair: 'You must confirm the need for a wheelchair',
      })
    })

    it('should return errors if there is no response to the healthConditions question', () => {
      ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue([])
      const page = new AccessNeedsFurtherQuestions({ ...body, healthConditions: undefined }, application)

      expect(page.errors()).toEqual({
        healthConditions: `You must specify if ${person.name} has any known health conditions`,
      })
    })

    it('should return errors if the person answers "yes" to the healthConditions question but does not provide details', () => {
      ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue([])

      const page = new AccessNeedsFurtherQuestions(
        { ...body, healthConditions: 'yes', healthConditionsDetail: undefined },
        application,
      )
      expect(page.errors()).toEqual({
        healthConditionsDetail: `You must provide details of ${person.name}'s health conditions`,
      })
    })

    it('should return errors if the person answered "yes" to pregancy healthcare questions but doesnt respond to pregnancy question', () => {
      ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue(['pregnancy'])

      const page = new AccessNeedsFurtherQuestions({ ...body, isPersonPregnant: undefined }, application)
      expect(page.errors()).toEqual({
        isPersonPregnant: `You must confirm if ${person.name} is pregnant`,
      })
    })

    it('should return errors if there are no responses to expectedDeliveryDate or childRemoved question and isPersonPregnant is yes', () => {
      ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue(['pregnancy'])

      const page = new AccessNeedsFurtherQuestions(
        {
          ...body,
          isPersonPregnant: 'yes',
          expectedDeliveryDate: undefined,
          'expectedDeliveryDate-year': undefined,
          'expectedDeliveryDate-month': undefined,
          'expectedDeliveryDate-day': undefined,
          childRemoved: undefined,
        },
        application,
      )
      expect(page.errors()).toEqual({
        expectedDeliveryDate: 'You must enter the expected delivery date',
        childRemoved: 'You must confirm if the child will be removed at birth',
      })
    })
  })

  describe('listOfNeeds', () => {
    it('should return null when no needs are selected', () => {
      ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue([])

      const page = new AccessNeedsFurtherQuestions(body, application)

      expect(page.listOfNeeds).toEqual(null)
    })

    it('should return a single need when one is selected', () => {
      ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue(['mobility'])

      const page = new AccessNeedsFurtherQuestions(body, application)

      expect(page.listOfNeeds).toEqual('mobility needs')
    })

    it('should return a list of needs', () => {
      ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue([
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
      ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue(['pregnancy'])

      const page = new AccessNeedsFurtherQuestions(body, application)

      expect(page.response()).toEqual({
        'Does John Wayne require the use of a wheelchair?': 'Yes',
        'Does John Wayne have any known health conditions?': 'Yes - Some detail',
        'Does John Wayne have any prescribed medication?': 'Yes - Some detail',
        'Is John Wayne pregnant?': 'Yes',
        'What is their expected date of delivery?': 'Sunday 19 February 2023',
        "Will the child be removed from John Wayne's care at birth?": 'No',
        'Are there any pregnancy related issues relevant to placement?': 'Yes - Some detail',
        "Specify any additional details and adjustments required for John Wayne's pregnancy needs": 'Adjustments',
      })
    })

    it('returns the correct plain english responses when the user responds that the person is not pregnant', () => {
      ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue(['mobility'])

      const page = new AccessNeedsFurtherQuestions(fromPartial({ ...body, isPersonPregnant: 'no' }), application)

      expect(page.response()).toEqual({
        'Does John Wayne require the use of a wheelchair?': 'Yes',
        'Does John Wayne have any known health conditions?': 'Yes - Some detail',
        'Does John Wayne have any prescribed medication?': 'Yes - Some detail',
        "Specify any additional details and adjustments required for John Wayne's mobility needs": 'Adjustments',
      })
    })
  })
})
