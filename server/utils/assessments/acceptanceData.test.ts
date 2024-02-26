import { createMock } from '@golevelup/ts-jest'
import { mockOptionalQuestionResponse, mockQuestionResponse } from '../../testutils/mockQuestionResponse'
import { MatchingInformationBody } from '../../form-pages/assess/matchingInformation/matchingInformationTask/matchingInformation'
import { acceptanceData, criteriaFromMatchingInformation, placementDates, placementRequestData } from './acceptanceData'
import { assessmentFactory } from '../../testutils/factories'
import { pageDataFromApplicationOrAssessment } from '../../form-pages/utils'
import { arrivalDateFromApplication } from '../applications/arrivalDateFromApplication'
import { placementDurationFromApplication } from './placementDurationFromApplication'
import { getResponses } from '../applications/getResponses'

jest.mock('../../form-pages/utils')
jest.mock('../retrieveQuestionResponseFromFormArtifact')
jest.mock('../applications/arrivalDateFromApplication')
jest.mock('./placementDurationFromApplication')
jest.mock('../applications/getResponses')

describe('acceptanceData', () => {
  const assessment = assessmentFactory.build()

  describe('acceptanceData', () => {
    it('should return the acceptance data for the assessment', () => {
      mockOptionalQuestionResponse({ cruInformation: 'Some notes' })
      const responses = { some: 'responses' }
      ;(getResponses as jest.Mock).mockReturnValue(responses)

      expect(acceptanceData(assessment)).toEqual({
        document: responses,
        requirements: placementRequestData(assessment),
        placementDates: placementDates(assessment),
        notes: 'Some notes',
      })
      expect(getResponses).toHaveBeenCalledWith(assessment)
    })
  })

  describe('placementDates', () => {
    const expectedArrival = '2020-01-01'

    it('should return the placement dates if an arrival date is provided', () => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(expectedArrival)

      mockOptionalQuestionResponse({ lengthOfStay: '12' })

      const result = placementDates(assessment)

      expect(result.expectedArrival).toEqual(expectedArrival)
      expect(result.duration).toEqual(12)
    })

    it('should return the default duration if a duration is not provided', () => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(expectedArrival)
      ;(placementDurationFromApplication as jest.Mock).mockReturnValueOnce('52')

      mockOptionalQuestionResponse({ lengthOfStay: undefined })

      const result = placementDates(assessment)

      expect(result.expectedArrival).toEqual(expectedArrival)
      expect(result.duration).toEqual(52)
    })

    it('should return null if the arrival date is not provided', () => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(undefined)

      const result = placementDates(assessment)

      expect(result).toBeNull()
    })
  })

  describe('placementRequestData', () => {
    const matchingInformation = createMock<MatchingInformationBody>({
      apType: 'isESAP',
      specialistSupportCriteria: [],
    })

    ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue(matchingInformation)

    it('converts matching data into a placement request', () => {
      mockQuestionResponse({ postcodeArea: 'ABC123', type: 'normal', duration: '12' })
      mockOptionalQuestionResponse({
        lengthOfStay: '12',
        alternativeRadius: '100',
      })

      expect(placementRequestData(assessment)).toEqual({
        gender: 'male',
        type: 'esap',
        location: 'ABC123',
        radius: '100',
        essentialCriteria: criteriaFromMatchingInformation(matchingInformation).essentialCriteria,
        desirableCriteria: criteriaFromMatchingInformation(matchingInformation).desirableCriteria,
      })
    })

    it('returns a default radius if one is not present', () => {
      mockOptionalQuestionResponse({ lengthOfStay: '12', alternativeRadius: undefined })

      const result = placementRequestData(assessment)

      expect(result.radius).toEqual(50)
    })
  })

  describe('criteriaFromMatchingInformation', () => {
    it('returns all essential criteria for essential and relevant matching information', () => {
      const matchingInformation = createMock<MatchingInformationBody>({
        apType: 'isESAP',
        specialistSupportCriteria: [],
        isWheelchairDesignated: 'essential',
        isStepFreeDesignated: 'essential',
        isCatered: 'essential',
        acceptsSexOffenders: 'relevant',
        acceptsChildSexOffenders: 'relevant',
        acceptsNonSexualChildOffenders: 'relevant',
        isArsonSuitable: 'relevant',
        acceptsHateCrimeOffenders: 'relevant',
        isSuitableForVulnerable: 'relevant',
      })

      const result = criteriaFromMatchingInformation(matchingInformation)

      expect(result.desirableCriteria).toEqual([])
      expect(result.essentialCriteria.sort()).toEqual(
        [
          'isESAP',
          'isWheelchairDesignated',
          'isStepFreeDesignated',
          'isCatered',
          'acceptsSexOffenders',
          'acceptsChildSexOffenders',
          'acceptsNonSexualChildOffenders',
          'isArsonSuitable',
          'acceptsHateCrimeOffenders',
          'isSuitableForVulnerable',
          'isSuitedForSexOffenders',
        ].sort(),
      )
    })

    it('returns all desirable criteria for desirable matching information', () => {
      const matchingInformation = createMock<MatchingInformationBody>({
        apType: 'normal',
        isWheelchairDesignated: 'desirable',
        isStepFreeDesignated: 'desirable',
        isCatered: 'desirable',
        specialistSupportCriteria: ['isSemiSpecialistMentalHealth'],
      })

      const result = criteriaFromMatchingInformation(matchingInformation)

      expect(result.desirableCriteria.sort()).toEqual(
        ['isStepFreeDesignated', 'isWheelchairDesignated', 'isCatered', 'isSemiSpecialistMentalHealth'].sort(),
      )
      expect(result.essentialCriteria).toEqual([])
    })

    it('returns empty objects for not relevant matching information', () => {
      const matchingInformation = createMock<MatchingInformationBody>({
        apType: 'normal',
        isWheelchairDesignated: 'notRelevant',
        isStepFreeDesignated: 'notRelevant',
        isCatered: 'notRelevant',
        acceptsSexOffenders: 'notRelevant',
        acceptsChildSexOffenders: 'notRelevant',
        acceptsNonSexualChildOffenders: 'notRelevant',
        isArsonSuitable: 'notRelevant',
        acceptsHateCrimeOffenders: 'notRelevant',
        isSuitableForVulnerable: 'notRelevant',
        specialistSupportCriteria: [],
      })

      expect(criteriaFromMatchingInformation(matchingInformation)).toEqual({
        desirableCriteria: [],
        essentialCriteria: [],
      })
    })
  })
})
