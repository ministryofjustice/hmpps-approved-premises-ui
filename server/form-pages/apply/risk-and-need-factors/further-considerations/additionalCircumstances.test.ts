import { YesOrNo } from '@approved-premises/ui'
import { itShouldHavePreviousValue } from '../../../shared'

import AdditionalCircumstances from './additionalCircumstances'
import { applicationFactory } from '../../../../testutils/factories'
import {
  shouldShowContingencyPlanPartnersPages,
  shouldShowContingencyPlanQuestionsPage,
} from '../../../../utils/applications/shouldShowContingencyPlanPages'

jest.mock('../../../../utils/applications/shouldShowContingencyPlanPages')

describe('AdditionalCircumstances', () => {
  const application = applicationFactory.build()

  const body = {
    additionalCircumstances: 'yes' as YesOrNo,
    additionalCircumstancesDetail: 'Additional circumstances detail',
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new AdditionalCircumstances(body, application)

      expect(page.body).toEqual(body)
    })
  })

  describe('next', () => {
    describe('if the contingency-plan-partners page should be shown', () => {
      ;(shouldShowContingencyPlanPartnersPages as jest.Mock).mockReturnValue(true)

      expect(new AdditionalCircumstances(body, application).next()).toBe('contingency-plan-partners')
    })

    describe('if the contingency-plan-questions page should be shown', () => {
      ;(shouldShowContingencyPlanPartnersPages as jest.Mock).mockReturnValue(false)
      ;(shouldShowContingencyPlanQuestionsPage as jest.Mock).mockReturnValue(true)

      expect(new AdditionalCircumstances(body, application).next()).toBe('contingency-plan-questions')
    })

    describe('if the contingency-plan-partners page should not be shown', () => {
      ;(shouldShowContingencyPlanPartnersPages as jest.Mock).mockReturnValue(false)
      ;(shouldShowContingencyPlanQuestionsPage as jest.Mock).mockReturnValue(false)

      expect(new AdditionalCircumstances(body, application).next()).toBe('')
    })
  })

  itShouldHavePreviousValue(new AdditionalCircumstances(body, application), 'arson')

  describe('errors', () => {
    it('should return errors when yes/no questions are blank', () => {
      const page = new AdditionalCircumstances({}, application)

      expect(page.errors()).toEqual({
        additionalCircumstances:
          'You must specify if the person there are any additional circumstances that have helped them do well in the past',
      })
    })

    it('shows errors when a question has a yes response, but the details are left out', () => {
      const page = new AdditionalCircumstances({ ...body, additionalCircumstancesDetail: '' }, application)

      expect(page.errors()).toEqual({
        additionalCircumstancesDetail: 'You must specify details of the additional circumstances',
      })
    })
  })

  describe('response', () => {
    it('Adds detail to an answer when the answer is yes', () => {
      const page = new AdditionalCircumstances(body, application)

      expect(page.response()).toEqual({
        'Are there are any additional circumstances that have helped the person do well in the past?':
          'Yes - Additional circumstances detail',
      })
    })

    it('does not add detail to questions with a no answer', () => {
      const page = new AdditionalCircumstances({ ...body, additionalCircumstances: 'no' }, application)

      expect(page.response()).toEqual({
        'Are there are any additional circumstances that have helped the person do well in the past?': 'No',
      })
    })
  })
})
