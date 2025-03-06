import { applicationFactory, assessmentFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import MatchingInformation, { MatchingInformationBody } from './matchingInformation'
import {
  defaultMatchingInformationValues,
  suggestedStaySummaryListOptions,
} from '../../../utils/matchingInformationUtils'

jest.mock('../../../../utils/assessments/placementDurationFromApplication')
jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')
jest.mock('../../../utils/matchingInformationUtils')

const assessment = assessmentFactory.build({
  application: applicationFactory.build({ isWomensApplication: false }),
})
const weAssessment = assessmentFactory.build({
  application: applicationFactory.build({ isWomensApplication: true }),
})

const defaultArguments = {
  apType: 'isESAP' as const,
  isArsonSuitable: 'essential',
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
  isArsonSuitable: 'essential',
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
        isStepFreeDesignated: 'You must specify a preference for step-free access',
        hasEnSuite: 'You must specify a preference for en-suite bathroom',
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

    it("should return an error if the type is not available for a women's application", () => {
      const page = new MatchingInformation({ ...defaultArguments, apType: 'isMHAPElliottHouse' }, weAssessment)

      expect(page.errors()).toEqual({
        apType: 'You must select the type of AP required',
      })
    })
  })

  describe('response', () => {
    it('returns the response', () => {
      const page = new MatchingInformation({ ...defaultArguments }, assessment)

      expect(page.response()).toEqual({
        'What type of AP is required?': 'Enhanced Security AP (ESAP)',
        'Suitable for active arson risk': 'Essential',
        'Room suitable for a person with sexual offences': 'Not relevant',
        'Wheelchair accessible': 'Essential',
        'Single room': 'Desirable',
        'Step-free access': 'Desirable',
        'Catering required': 'Not relevant',
        'En-suite bathroom': 'Not relevant',
        'Vulnerable to exploitation': 'Relevant',
        'Sexual offences against an adult': 'Relevant',
        'Sexual offences against children': 'Relevant',
        'Non sexual offences against children': 'Relevant',
        'Hate based offences': 'Relevant',
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

  describe('apTypesItems', () => {
    it('converts all available AP types to radio items', () => {
      const page = new MatchingInformation({ apType: 'isPIPE' }, assessment)
      const items = page.apTypeItems

      expect(items).toEqual([
        { value: 'normal', text: 'Standard AP', checked: false },
        { value: 'isPIPE', text: 'Psychologically Informed Planned Environment (PIPE)', checked: true },
        { value: 'isESAP', text: 'Enhanced Security AP (ESAP)', checked: false },
        { value: 'isRecoveryFocussed', text: 'Recovery Focused AP (RFAP)', checked: false },
        { value: 'isMHAPElliottHouse', text: 'Specialist Mental Health AP (Elliott House - Midlands)', checked: false },
        {
          value: 'isMHAPStJosephs',
          text: 'Specialist Mental Health AP (St Josephs - Greater Manchester)',
          checked: false,
        },
      ])
    })

    describe("when assessing a women's estate application", () => {
      it('restricts the available AP types', () => {
        const page = new MatchingInformation({ apType: 'normal' }, weAssessment)
        const items = page.apTypeItems

        expect(items).toEqual([
          { value: 'normal', text: 'Standard AP', checked: true },
          { value: 'isPIPE', text: 'Psychologically Informed Planned Environment (PIPE)', checked: false },
          { value: 'isESAP', text: 'Enhanced Security AP (ESAP)', checked: false },
        ])
      })
    })
  })
})
