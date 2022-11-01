import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import applicationFactory from '../../../testutils/factories/application'
import personFactory from '../../../testutils/factories/person'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'
import RehabilitativeInterventions, { interventionsTranslations } from './rehabilitativeInterventions'

jest.mock('../../../utils/formUtils')

describe('RehabilitativeInterventions', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })
  const previousPage = 'previousPage'

  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new RehabilitativeInterventions(
        { interventions: 'accomodation', something: 'else' },
        application,
        previousPage,
      )

      expect(page.body).toEqual({ interventions: ['accomodation'] })
    })
  })

  describe('it should return the value passed in for the previous page ', () => {
    itShouldHavePreviousValue(new RehabilitativeInterventions({}, application, previousPage), previousPage)
  })

  itShouldHaveNextValue(new RehabilitativeInterventions({}, application, previousPage), '')

  describe('response', () => {
    describe('should return a translated version of the response', () => {
      it('When there are multiple interventions', () => {
        const page = new RehabilitativeInterventions(
          {
            interventions: [
              'accomodation',
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
            'Accomodation, Drugs and alcohol, Children and families, Health, Education, training and employment, Finance, benefits and debt, Attitudes, thinking and behaviour, Abuse, Other',
          'Other intervention': 'Some intervention',
        })
      })

      it('When there is a single intervention', () => {
        const page = new RehabilitativeInterventions({ interventions: 'health' }, application, previousPage)

        expect(page.response()).toEqual({
          "Which rehabilitative interventions will support the person's Approved Premises (AP) placement?": 'Health',
        })
      })
    })
  })
  describe('items', () => {
    it('calls convertKeyValuePairToCheckBoxItems with the correct arguments', () => {
      const { other, ...interventionsForCheckboxes } = interventionsTranslations
      new RehabilitativeInterventions({ interventions: 'health' }, application, previousPage).items()
      expect(convertKeyValuePairToCheckBoxItems).toHaveBeenCalledWith(interventionsForCheckboxes, ['health'])
    })
  })
})
