import { createMock } from '@golevelup/ts-jest'
import { ApType } from '@approved-premises/api'
import { mockOptionalQuestionResponse, mockQuestionResponse } from '../../testutils/mockQuestionResponse'
import MatchingInformation, {
  MatchingInformationBody,
} from '../../form-pages/assess/matchingInformation/matchingInformationTask/matchingInformation'
import {
  acceptanceData,
  apTypeFromAssessment,
  criteriaFromMatchingInformation,
  placementDates,
  placementRequestData,
} from './acceptanceData'
import { assessmentFactory } from '../../testutils/factories'
import { pageDataFromApplicationOrAssessment } from '../../form-pages/utils'
import { arrivalDateFromApplication } from '../applications/arrivalDateFromApplication'
import { placementDurationFromApplication } from '../applications/placementDurationFromApplication'
import { getResponses } from '../applications/getResponses'
import { ApTypeCriteria } from '../placementCriteriaUtils'
import ApplicationTimeliness, {
  ApplicationTimelinessBody,
} from '../../form-pages/assess/assessApplication/suitablityAssessment/applicationTimeliness'
import { TasklistPageInterface } from '../../form-pages/tasklistPage'

jest.mock('../../form-pages/utils')
jest.mock('../retrieveQuestionResponseFromFormArtifact')
jest.mock('../applications/arrivalDateFromApplication')
jest.mock('../applications/applicantAndCaseManagerDetails')
jest.mock('../applications/placementDurationFromApplication')
jest.mock('../applications/getResponses')

describe('acceptanceData', () => {
  const assessment = assessmentFactory.build()

  describe('acceptanceData', () => {
    const matchingInformation = createMock<MatchingInformationBody>({ apType: 'normal' })
    let timelinessInformation = {}
    const responses = { some: 'responses' }

    beforeEach(() => {
      ;(pageDataFromApplicationOrAssessment as jest.Mock).mockImplementation((page: TasklistPageInterface) => {
        switch (page) {
          case MatchingInformation:
            return matchingInformation
          case ApplicationTimeliness:
            return timelinessInformation
          default:
            return {}
        }
      })
      mockOptionalQuestionResponse({ cruInformation: 'Some notes' })
      ;(getResponses as jest.Mock).mockReturnValue(responses)
    })

    it('should return the acceptance data for the assessment', () => {
      expect(acceptanceData(assessment)).toEqual({
        document: responses,
        requirements: placementRequestData(assessment),
        placementDates: placementDates(assessment),
        notes: 'Some notes',
        apType: apTypeFromAssessment(assessment),
      })
      expect(getResponses).toHaveBeenCalledWith(assessment)
    })

    it('should return the acceptance data for the assessment with optional timeliness information', () => {
      timelinessInformation = createMock<ApplicationTimelinessBody>({
        agreeWithShortNoticeReason: 'no',
        agreeWithShortNoticeReasonComments: 'comments',
        reasonForLateApplication: 'furtherOffence',
      })
      expect(acceptanceData(assessment)).toEqual({
        document: responses,
        requirements: placementRequestData(assessment),
        placementDates: placementDates(assessment),
        notes: 'Some notes',
        apType: apTypeFromAssessment(assessment),
        ...timelinessInformation,
        agreeWithShortNoticeReason: false,
      })
      expect(getResponses).toHaveBeenCalledWith(assessment)
    })
  })

  describe('placementDates', () => {
    const expectedArrival = '2020-01-01'

    it('should return the placement dates if an arrival date is provided', () => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(expectedArrival)
      ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue({
        lengthOfStayWeeks: '1',
        lengthOfStayDays: '5',
        lengthOfStayAgreed: 'no',
      })

      const result = placementDates(assessment)

      expect(result.expectedArrival).toEqual(expectedArrival)
      expect(result.duration).toEqual(12)
    })

    it('should return the duration from the application if a duration is not provided', () => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(expectedArrival)
      ;(placementDurationFromApplication as jest.Mock).mockReturnValueOnce('52')
      ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue({ lengthOfStayAgreed: 'yes' })

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
    it('converts matching data into a placement request', () => {
      const matchingInformation = createMock<MatchingInformationBody>({ apType: 'normal' })
      ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue(matchingInformation)

      mockQuestionResponse({ postcodeArea: 'ABC123', type: 'normal', duration: '12' })
      mockOptionalQuestionResponse({
        alternativeRadius: '100',
      })

      expect(placementRequestData(assessment)).toEqual({
        type: 'normal',
        location: 'ABC123',
        radius: '100',
        essentialCriteria: criteriaFromMatchingInformation(matchingInformation),
        desirableCriteria: [],
      })
    })

    describe('type', () => {
      it.each<[ApType, ApTypeCriteria]>([
        ['pipe', 'isPIPE'],
        ['esap', 'isESAP'],
        ['rfap', 'isRecoveryFocussed'],
        ['mhapElliottHouse', 'isMHAPElliottHouse'],
        ['mhapStJosephs', 'isMHAPStJosephs'],
        ['normal', 'normal'],
      ])('is set to "%s" when `apType` is "%s" on the Matching Information page', (apType, apTypeCriteria) => {
        const matchingInformation = createMock<MatchingInformationBody>({ apType: apTypeCriteria })
        ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue(matchingInformation)

        expect(placementRequestData(assessment).type).toEqual(apType)
      })
    })

    describe('radius', () => {
      it('returns a default if `alternativeRadius` is undefined', () => {
        const matchingInformation = createMock<MatchingInformationBody>({ apType: 'normal' })
        ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue(matchingInformation)

        mockOptionalQuestionResponse({ alternativeRadius: undefined })

        expect(placementRequestData(assessment).radius).toEqual(50)
      })
    })
  })

  describe('criteriaFromMatchingInformation', () => {
    it('returns all essential criteria for essential and relevant matching information', () => {
      const matchingInformation = createMock<MatchingInformationBody>({
        apType: 'isESAP',
        isWheelchairDesignated: 'required',
        isStepFreeDesignated: 'required',
        acceptsSexOffenders: 'relevant',
        acceptsChildSexOffenders: 'relevant',
        acceptsNonSexualChildOffenders: 'relevant',
        isSuitableForVulnerable: 'relevant',
      })

      const result = criteriaFromMatchingInformation(matchingInformation)

      expect(result.sort()).toEqual(
        [
          'isESAP',
          'isWheelchairDesignated',
          'isStepFreeDesignated',
          'acceptsSexOffenders',
          'acceptsChildSexOffenders',
          'acceptsNonSexualChildOffenders',
          'isSuitableForVulnerable',
          'isSuitedForSexOffenders',
        ].sort(),
      )
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
        isSuitableForVulnerable: 'notRelevant',
      })

      expect(criteriaFromMatchingInformation(matchingInformation)).toEqual([])
    })
  })
})
