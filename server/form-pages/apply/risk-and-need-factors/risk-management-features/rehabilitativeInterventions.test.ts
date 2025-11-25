import { fromPartial } from '@total-typescript/shoehorn'

import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'

import { applicationFactory, personFactory } from '../../../../testutils/factories'
import * as formUtils from '../../../../utils/formUtils'
import RehabilitativeInterventions, { interventionsTranslations } from './rehabilitativeInterventions'
import { ApprovedPremisesApplication as Application } from '../../../../@types/shared'

describe('RehabilitativeInterventions', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  let application: Application
  const body = {
    rehabilitativeInterventions: 'accommodation' as const,
    summary: 'a summary',
    otherIntervention: 'some intervention',
  }

  beforeEach(() => {
    application = applicationFactory.build({ person })
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new RehabilitativeInterventions(body, application)

      expect(page.body).toEqual({
        rehabilitativeInterventions: ['accommodation'],
        summary: 'a summary',
        otherIntervention: 'some intervention',
      })
    })
  })

  describe('if the user answered "yes" to convictedOffences', () => {
    application = applicationFactory
      .withPageResponse({
        task: 'risk-management-features',
        page: 'convicted-offences',
        key: 'response',
        value: 'yes',
      })
      .build()

    itShouldHavePreviousValue(new RehabilitativeInterventions(body, application), 'date-of-offence')
  })

  describe('if the user didnt answer "yes" to convictedOffences', () => {
    application = applicationFactory
      .withPageResponse({
        task: 'risk-management-features',
        page: 'convicted-offences',
        key: 'response',
        value: 'no',
      })
      .build()

    itShouldHavePreviousValue(new RehabilitativeInterventions(body, application), 'convicted-offences')
  })

  itShouldHaveNextValue(new RehabilitativeInterventions(body, application), '')

  describe('errors', () => {
    it("should return an error if 'rehabilitativeInterventions' isn't populated", () => {
      const page = new RehabilitativeInterventions(
        fromPartial({ ...body, rehabilitativeInterventions: undefined }),
        application,
      )
      expect(page.errors()).toEqual({ rehabilitativeInterventions: 'You must select at least one option' })
    })

    it('should return an error if "rehabilitativeInterventions" includes "other" and no other intervention is supplied', () => {
      expect(
        new RehabilitativeInterventions(
          { ...body, rehabilitativeInterventions: ['other', 'accommodation'], otherIntervention: '' },
          application,
        ).errors(),
      ).toEqual({ otherIntervention: 'You must specify the other intervention' })

      expect(
        new RehabilitativeInterventions(
          { ...body, rehabilitativeInterventions: 'other', otherIntervention: '' },
          application,
        ).errors(),
      ).toEqual({
        otherIntervention: 'You must specify the other intervention',
      })
    })

    it('should return an error if no summary is given', () => {
      expect(
        new RehabilitativeInterventions(
          fromPartial({ rehabilitativeInterventions: ['accommodation'] }),
          application,
        ).errors(),
      ).toEqual({
        summary:
          'You must provide a summary of how these interventions will assist the persons rehabilitation in the AP',
      })
    })

    it('should return an empty object if "rehabilitativeInterventions" is populated with an array of interventions and a summary is provided', () => {
      const page = new RehabilitativeInterventions(
        { ...body, rehabilitativeInterventions: ['accommodation'] },
        application,
      )
      expect(page.errors()).toEqual({})
    })
  })

  describe('response', () => {
    describe('should return a translated version of the response', () => {
      it('When there are multiple interventions', () => {
        const page = new RehabilitativeInterventions(
          {
            ...body,
            rehabilitativeInterventions: [
              'accommodation',
              'drugsAndAlcohol',
              'childrenAndFamilies',
              'health',
              'educationTrainingAndEmployment',
              'financeBenefitsAndDebt',
              'attitudesAndBehaviour',
              'abuse',
              'other',
            ],
            otherIntervention: 'Some intervention',
          },
          application,
        )

        expect(page.response()).toEqual({
          "Which of the rehabilitative activities will assist the person's rehabilitation in the Approved Premises (AP)?":
            'Accommodation, Drugs and alcohol, Children and families, Health, Education, training and employment, Finance, benefits and debt, Attitudes, thinking and behaviour, Abuse, Other',
          'Other intervention': 'Some intervention',
          'Provide a summary of how these interventions will assist the persons rehabilitation in the AP.': 'a summary',
        })
      })

      it('When there is a single intervention', () => {
        const page = new RehabilitativeInterventions({ ...body, rehabilitativeInterventions: 'health' }, application)

        expect(page.response()).toEqual({
          "Which of the rehabilitative activities will assist the person's rehabilitation in the Approved Premises (AP)?":
            'Health',
          'Provide a summary of how these interventions will assist the persons rehabilitation in the AP.': 'a summary',
        })
      })
    })
  })
  describe('items', () => {
    it('calls convertKeyValuePairToCheckBoxItems with the correct arguments', () => {
      jest.spyOn(formUtils, 'convertKeyValuePairToCheckBoxItems')

      const { other, ...interventionsForCheckboxes } = interventionsTranslations
      new RehabilitativeInterventions({ ...body, rehabilitativeInterventions: 'health' }, application).items()

      expect(formUtils.convertKeyValuePairToCheckBoxItems).toHaveBeenCalledWith(interventionsForCheckboxes, ['health'])
    })
  })
})
