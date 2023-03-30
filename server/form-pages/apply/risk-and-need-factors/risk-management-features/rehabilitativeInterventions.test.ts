import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { convertKeyValuePairToCheckBoxItems } from '../../../../utils/formUtils'
import RehabilitativeInterventions, { interventionsTranslations } from './rehabilitativeInterventions'
import { ApprovedPremisesApplication as Application } from '../../../../@types/shared'

jest.mock('../../../../utils/formUtils')

describe('RehabilitativeInterventions', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  let application: Application

  beforeEach(() => {
    application = applicationFactory.build({ person })
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new RehabilitativeInterventions({ rehabilitativeInterventions: 'accommodation' }, application)

      expect(page.body).toEqual({ rehabilitativeInterventions: ['accommodation'] })
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

    itShouldHavePreviousValue(new RehabilitativeInterventions({}, application), 'convicted-offences')
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

    itShouldHavePreviousValue(new RehabilitativeInterventions({}, application), 'date-of-offence')
  })

  itShouldHaveNextValue(new RehabilitativeInterventions({}, application), '')

  describe('errors', () => {
    it("should return an error if 'rehabilitativeInterventions' isn't populated", () => {
      const page = new RehabilitativeInterventions({}, application)
      expect(page.errors()).toEqual({ rehabilitativeInterventions: 'You must select at least one option' })
    })

    it('should return an empty object if "rehabilitativeInterventions" is populated with an array of interventions', () => {
      const page = new RehabilitativeInterventions({ rehabilitativeInterventions: ['accommodation'] }, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an error if "rehabilitativeInterventions" includes "other" and no other intervention is supplied', () => {
      expect(
        new RehabilitativeInterventions(
          { rehabilitativeInterventions: ['other', 'accommodation'] },
          application,
        ).errors(),
      ).toEqual({ otherIntervention: 'You must specify the other intervention' })

      expect(new RehabilitativeInterventions({ rehabilitativeInterventions: 'other' }, application).errors()).toEqual({
        otherIntervention: 'You must specify the other intervention',
      })
    })
  })

  describe('response', () => {
    describe('should return a translated version of the response', () => {
      it('When there are multiple interventions', () => {
        const page = new RehabilitativeInterventions(
          {
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
        })
      })

      it('When there is a single intervention', () => {
        const page = new RehabilitativeInterventions({ rehabilitativeInterventions: 'health' }, application)

        expect(page.response()).toEqual({
          "Which of the rehabilitative activities will assist the person's rehabilitation in the Approved Premises (AP)?":
            'Health',
        })
      })
    })
  })
  describe('items', () => {
    it('calls convertKeyValuePairToCheckBoxItems with the correct arguments', () => {
      const { other, ...interventionsForCheckboxes } = interventionsTranslations
      new RehabilitativeInterventions({ rehabilitativeInterventions: 'health' }, application).items()
      expect(convertKeyValuePairToCheckBoxItems).toHaveBeenCalledWith(interventionsForCheckboxes, ['health'])
    })
  })
})
