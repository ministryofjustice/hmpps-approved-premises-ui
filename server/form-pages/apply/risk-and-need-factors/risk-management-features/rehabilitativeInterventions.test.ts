import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import applicationFactory from '../../../../testutils/factories/application'
import personFactory from '../../../../testutils/factories/person'
import { convertKeyValuePairToCheckBoxItems } from '../../../../utils/formUtils'
import RehabilitativeInterventions, { interventionsTranslations } from './rehabilitativeInterventions'

jest.mock('../../../../utils/formUtils')

describe('RehabilitativeInterventions', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })
  const previousPage = 'previousPage'

  describe('body', () => {
    it('should set the body', () => {
      const page = new RehabilitativeInterventions(
        { rehabilitativeInterventions: 'accommodation' },
        application,
        previousPage,
      )

      expect(page.body).toEqual({ rehabilitativeInterventions: ['accommodation'] })
    })
  })

  describe('it should return the value passed in for the previous page ', () => {
    itShouldHavePreviousValue(new RehabilitativeInterventions({}, application, previousPage), previousPage)
  })

  itShouldHaveNextValue(new RehabilitativeInterventions({}, application, previousPage), '')

  describe('errors', () => {
    it("should return an error if 'rehabilitativeInterventions' isn't populated", () => {
      const page = new RehabilitativeInterventions({}, application, previousPage)
      expect(page.errors()).toEqual({ rehabilitativeInterventions: 'You must select at least one option' })
    })

    it('should return an empty object if "rehabilitativeInterventions" is populated with an array of interventions', () => {
      const page = new RehabilitativeInterventions(
        { rehabilitativeInterventions: ['accommodation'] },
        application,
        previousPage,
      )
      expect(page.errors()).toEqual({})
    })

    it('should return an error if "rehabilitativeInterventions" includes "other" and no other intervention is supplied', () => {
      expect(
        new RehabilitativeInterventions(
          { rehabilitativeInterventions: ['other', 'accommodation'] },
          application,
          previousPage,
        ).errors(),
      ).toEqual({ otherIntervention: 'You must specify the other intervention' })

      expect(
        new RehabilitativeInterventions({ rehabilitativeInterventions: 'other' }, application, previousPage).errors(),
      ).toEqual({
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
          previousPage,
        )

        expect(page.response()).toEqual({
          "Which rehabilitative interventions will support the person's Approved Premises (AP) placement?":
            'Accommodation, Drugs and alcohol, Children and families, Health, Education, training and employment, Finance, benefits and debt, Attitudes, thinking and behaviour, Abuse, Other',
          'Other intervention': 'Some intervention',
        })
      })

      it('When there is a single intervention', () => {
        const page = new RehabilitativeInterventions(
          { rehabilitativeInterventions: 'health' },
          application,
          previousPage,
        )

        expect(page.response()).toEqual({
          "Which rehabilitative interventions will support the person's Approved Premises (AP) placement?": 'Health',
        })
      })
    })
  })
  describe('items', () => {
    it('calls convertKeyValuePairToCheckBoxItems with the correct arguments', () => {
      const { other, ...interventionsForCheckboxes } = interventionsTranslations
      new RehabilitativeInterventions({ rehabilitativeInterventions: 'health' }, application, previousPage).items()
      expect(convertKeyValuePairToCheckBoxItems).toHaveBeenCalledWith(interventionsForCheckboxes, ['health'])
    })
  })
})
