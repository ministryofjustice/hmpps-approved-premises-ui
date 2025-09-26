import { ContingencyPlanQuestionsBody } from '../../../../@types/ui'
import {
  applicationFactory,
  contingencyPlanPartnerFactory,
  contingencyPlanQuestionsBodyFactory,
} from '../../../../testutils/factories'

import { itShouldHavePreviousValue } from '../../../shared'

import ContingencyPlanQuestions from './contingencyPlanQuestions'

const contingencyPlanPartnerFactorys = contingencyPlanPartnerFactory.buildList(2)

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact.ts', () => {
  return {
    retrieveOptionalQuestionResponseFromFormArtifact: jest.fn(() => contingencyPlanPartnerFactorys),
  }
})

describe('ContingencyPlanQuestions', () => {
  const body = contingencyPlanQuestionsBodyFactory.build()
  const application = applicationFactory.build()

  describe('title', () => {
    it('should set the title', () => {
      const page = new ContingencyPlanQuestions(body, application)

      expect(page.title).toEqual('Contingency plans')
    })
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new ContingencyPlanQuestions(body, application)

      expect(page.body).toEqual(body)
    })

    it('should add the contingency plan partners name to the body', () => {
      const page = new ContingencyPlanQuestions(body, application)

      expect(page.contingencyPlanPartnerNames).toEqual([
        contingencyPlanPartnerFactorys[0].partnerAgencyName,
        contingencyPlanPartnerFactorys[1].partnerAgencyName,
      ])
    })
  })

  describe('next', () => {
    it('should return trigger-plan', () => {
      expect(new ContingencyPlanQuestions(body, application).next()).toBe('trigger-plan')
    })
  })

  itShouldHavePreviousValue(new ContingencyPlanQuestions(body, application), 'contingency-plan-partners')
  describe('errors', () => {
    const page = new ContingencyPlanQuestions({} as ContingencyPlanQuestionsBody, application)

    expect(page.errors()).toEqual({
      noReturn: 'You must detail the actions that should be taken if the person does not return to the AP for curfew',
      placementWithdrawn:
        "You must detail any actions that should be taken if the person's placement needs to be withdrawn out of hours",
      victimConsiderations:
        'You must detail any victim considerations that the AP need to be aware of when out of hours',
      unsuitableAddresses: 'You must detail any unsuitable addresses that the person cannot reside at',
      suitableAddresses: 'You must detail alternative suitable addresses that the person can reside at',
      breachInformation: 'You must detail any further information to support OoH decision making',
      otherConsiderations: 'You must detail any other considerations',
    })
  })

  describe('response', () => {
    it('should return the responses to the question in plain english', () => {
      const page = new ContingencyPlanQuestions(body, application)

      expect(page.response()).toEqual({
        'Are there any other considerations?': body.otherConsiderations,
        'If the person does not return to the AP for curfew, what actions should be taken?': body.noReturn,
        "If the person's placement needs to be withdrawn out of hours, what actions should be taken?":
          body.placementWithdrawn,
        'In the event of a breach, provide any further information to support Out of Hours (OoH) decision making':
          body.breachInformation,
        'In the event of an out of hours placement withdrawal, provide alternative suitable addresses that the person can reside at':
          body.suitableAddresses,
        'In the event of an out of hours placement withdrawal, provide any unsuitable addresses that the person cannot reside at':
          body.unsuitableAddresses,
        'Provide any victim considerations that the AP need to be aware of when out of hours':
          body.victimConsiderations,
      })
    })
  })
})
