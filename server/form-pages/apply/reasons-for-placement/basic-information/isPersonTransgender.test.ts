import { fromPartial } from '@total-typescript/shoehorn'
import { YesOrNo } from '@approved-premises/ui'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'

import IsPersonTransgender from './isPersonTransgender'

describe('IsPersonTransgender', () => {
  const body = {
    transgenderOrHasTransgenderHistory: 'yes' as YesOrNo,
  }

  describe('body', () => {
    it('should set the body', () => {
      const page = new IsPersonTransgender(body)

      expect(page.body).toEqual(body)
    })
  })
  describe('if the answer is yes', () => {
    itShouldHaveNextValue(new IsPersonTransgender(body), 'male-ap')
  })

  describe('if the answer is no', () => {
    itShouldHaveNextValue(new IsPersonTransgender({ transgenderOrHasTransgenderHistory: 'no' }), 'relevant-dates')
  })

  itShouldHavePreviousValue(new IsPersonTransgender(body), 'confirm-your-details')

  describe('errors', () => {
    it('should return errors when yes/no questions are blank', () => {
      const page = new IsPersonTransgender(fromPartial({}))

      expect(page.errors()).toEqual({
        transgenderOrHasTransgenderHistory:
          'You must specify if the person is transgender of if they have a transgender history',
      })
    })
  })

  describe('response', () => {
    it('Returns the full question and answer', () => {
      const page = new IsPersonTransgender(body)

      expect(page.response()).toEqual({
        'Is the person transgender or do they have a transgender history?': 'Yes',
      })
    })
  })
})
