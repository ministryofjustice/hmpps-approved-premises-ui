import { YesOrNo } from '@approved-premises/ui'
import { fromPartial } from '@total-typescript/shoehorn'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import IsPersonTransgender from './isPersonTransgender'
import { applicationFactory, personFactory } from '../../../../testutils/factories'

describe('IsPersonTransgender', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  const body = {
    transgenderOrHasTransgenderHistory: 'yes' as YesOrNo,
  }

  describe('title', () => {
    it("adds the person's name to the question title", () => {
      const page = new IsPersonTransgender(body, application)

      expect(page.question).toEqual('Is John Wayne transgender or do they have a transgender history?')
    })
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new IsPersonTransgender(body, application)

      expect(page.body).toEqual(body)
    })
  })
  describe('if the answer is yes', () => {
    itShouldHaveNextValue(new IsPersonTransgender(body, application), 'complex-case-board')
  })

  describe('if the answer is no', () => {
    itShouldHaveNextValue(
      new IsPersonTransgender({ transgenderOrHasTransgenderHistory: 'no' }, application),
      'sentence-type',
    )
  })

  itShouldHavePreviousValue(new IsPersonTransgender(body, application), '')

  describe('errors', () => {
    it('should return errors when yes/no questions are blank', () => {
      const page = new IsPersonTransgender(fromPartial({}), application)

      expect(page.errors()).toEqual({
        transgenderOrHasTransgenderHistory:
          'You must specify if John Wayne is transgender of if they have a transgender history',
      })
    })
  })

  describe('response', () => {
    it('Returns the full question and answer', () => {
      const page = new IsPersonTransgender(body, application)

      expect(page.response()).toEqual({
        'Is John Wayne transgender or do they have a transgender history?': 'Yes',
      })
    })
  })
})
