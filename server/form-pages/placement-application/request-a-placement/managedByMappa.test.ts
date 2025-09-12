import { fromPartial } from '@total-typescript/shoehorn'
import { itShouldHavePreviousValue } from '../../shared-examples'

import ManagedByMappa from './managedByMappa'

describe('ManagedByMappa', () => {
  const body = {
    managedByMappa: 'yes' as const,
  }
  describe('next', () => {
    it('if the answer is "yes" it should be "release-date"', () => {
      expect(new ManagedByMappa(fromPartial({ managedByMappa: 'yes' })).next()).toEqual('additional-placement-details')
    })

    it('if the answer is "no" it should be "sentence-type"', () => {
      expect(new ManagedByMappa(fromPartial({ managedByMappa: 'no' })).next()).toEqual('sentence-type')
    })
  })

  itShouldHavePreviousValue(new ManagedByMappa(body), 'sentence-type')
})
