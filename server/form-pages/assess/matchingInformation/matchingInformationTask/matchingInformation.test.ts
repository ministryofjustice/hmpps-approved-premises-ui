import { assessmentFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import MatchingInformation, { MatchingInformationBody } from './matchingInformation'
import {
  defaultMatchingInformationValues,
  suggestedStaySummaryListOptions,
} from '../../../utils/matchingInformationUtils'

jest.mock('../../../../utils/assessments/placementDurationFromApplication')
jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')
jest.mock('../../../utils/matchingInformationUtils')

const assessment = assessmentFactory.build()

const defaultArguments = {
  apType: 'isESAP' as const,
  isArsonDesignated: 'essential',
  isWheelchairDesignated: 'essential',
  isSingle: 'desirable',
  isStepFreeDesignated: 'desirable',
  isCatered: 'notRelevant',
  hasEnSuite: 'notRelevant',
  isSuitableForVulnerable: 'relevant',
  acceptsSexOffenders: 'relevant',
  acceptsChildSexOffenders: 'relevant',
  acceptsNonSexualChildOffenders: 'relevant',
  acceptsHateCrimeOffenders: 'relevant',
  isArsonSuitable: 'relevant',
  isSuitedForSexOffenders: 'notRelevant',
  lengthOfStayAgreed: 'yes',
  cruInformation: 'Some info',
} as MatchingInformationBody

const defaultMatchingInformationValuesReturnValue: Partial<MatchingInformationBody> = {
  acceptsNonSexualChildOffenders: 'relevant',
  acceptsChildSexOffenders: 'relevant',
  acceptsHateCrimeOffenders: 'relevant',
  acceptsSexOffenders: 'relevant',
  apType: 'isPIPE',
  isArsonDesignated: 'essential',
  isArsonSuitable: 'relevant',
  isCatered: 'essential',
  isSingle: 'desirable',
  isSuitableForVulnerable: 'relevant',
  isSuitedForSexOffenders: 'desirable',
  isWheelchairDesignated: 'notRelevant',
  lengthOfStay: '32',
}

describe('MatchingInformation', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('title', () => {
    expect(new MatchingInformation(defaultArguments, assessment).title).toBe('Matching information')
  })

  describe('body', () => {
    it('should set the body', () => {
      ;(defaultMatchingInformationValues as jest.Mock).mockReturnValue(defaultMatchingInformationValuesReturnValue)

      const page = new MatchingInformation(defaultArguments, assessment)

      expect(page.body).toEqual({ ...defaultArguments, ...defaultMatchingInformationValuesReturnValue })
    })
  })

  itShouldHaveNextValue(new MatchingInformation(defaultArguments, assessment), '')

  itShouldHavePreviousValue(new MatchingInformation(defaultArguments, assessment), 'dashboard')

  describe('errors', () => {
    it('should have an error if there is no answers', () => {
      ;(defaultMatchingInformationValues as jest.Mock).mockReturnValue(defaultMatchingInformationValuesReturnValue)

      const page = new MatchingInformation({}, assessment)

      expect(page.errors()).toEqual({
        isStepFreeDesignated: 'You must specify a preference for limited mobility',
        hasEnSuite: 'You must specify a preference for en-suite (room)',
        lengthOfStayAgreed: 'You must state if you agree with the length of the stay',
      })
    })

    it('should add an error if lengthOfStayAgreed is no and the details are not provided', () => {
      const page = new MatchingInformation(
        { ...defaultArguments, lengthOfStayAgreed: 'no', lengthOfStayWeeks: null, lengthOfStayDays: null },
        assessment,
      )

      expect(page.errors()).toEqual({
        lengthOfStay: 'You must provide a recommended length of stay',
      })
    })
  })

  describe('response', () => {
    it('returns the response', () => {
      const page = new MatchingInformation({ ...defaultArguments }, assessment)

      expect(page.response()).toEqual({
        'What type of AP is required?': 'Enhanced Security AP (ESAP)',
        'Designated arson room': 'Essential',
        'Room suitable for a person with sexual offences': 'Not relevant',
        'Wheelchair needs': 'Essential',
        'Single (room)': 'Desirable',
        'Limited mobility': 'Desirable',
        'Catered (property)': 'Not relevant',
        'En-suite (room)': 'Not relevant',
        'At risk of criminal exploitation': 'Relevant',
        'Poses sexual risk to adults': 'Relevant',
        'Poses risk to children': 'Relevant',
        'Non sexual offences against children': 'Relevant',
        'Has committed hate-based offences': 'Relevant',
        'Poses arson risk': 'Relevant',
        'Do you agree with the suggested length of stay?': 'Yes',
        'Information for Central Referral Unit (CRU) manager': 'Some info',
      })
    })

    it('adds the recommended length of stay if lengthOfStayAgreed is no', () => {
      const page = new MatchingInformation(
        {
          ...defaultArguments,
          lengthOfStayAgreed: 'no',
          lengthOfStayDays: '5',
          lengthOfStayWeeks: '5',
        },
        assessment,
      )

      const response = page.response()

      expect(response['Do you agree with the suggested length of stay?']).toEqual('No')
      expect(response['Recommended length of stay']).toEqual('5 weeks, 5 days')
    })
  })

  describe('suggestedStaySummaryListOptions', () => {
    it('wraps around the namesake utils method, returning its return value', () => {
      const page = new MatchingInformation(defaultArguments, assessment)

      const utilsReturnValue = {
        rows: [
          { key: { text: 'Placement duration' }, value: { text: 'a formatted duration' } },
          { key: { text: 'Dates of placement' }, value: { text: 'formatted dates of placement' } },
        ],
      }
      ;(suggestedStaySummaryListOptions as jest.Mock).mockReturnValue(utilsReturnValue)

      expect(page.suggestedStaySummaryListOptions).toEqual(utilsReturnValue)
      expect(suggestedStaySummaryListOptions).toHaveBeenLastCalledWith(assessment.application)
    })
  })
})
