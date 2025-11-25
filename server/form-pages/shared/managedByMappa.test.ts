import { fromPartial } from '@total-typescript/shoehorn'
import { itShouldHavePreviousValue } from '.'

import ManagedByMappa from './managedByMappa'

describe('ManagedByMappa', () => {
  const body = {
    managedByMappa: 'yes' as const,
  }

  describe('body', () => {
    it('should set the body', () => {
      const page = new ManagedByMappa(body)

      expect(page.body).toEqual(body)
    })
  })

  describe('next', () => {
    it('if the answer is "yes" it should be "release-date"', () => {
      expect(new ManagedByMappa(fromPartial({ managedByMappa: 'yes' })).next()).toEqual('release-date')
    })

    it('if the answer is "no" it should be "sentence-type"', () => {
      expect(new ManagedByMappa(fromPartial({ managedByMappa: 'no' })).next()).toEqual('sentence-type')
    })
  })

  itShouldHavePreviousValue(new ManagedByMappa(body), 'sentence-type')

  describe('errors', () => {
    it('should return errors when yes/no questions are blank', () => {
      const page = new ManagedByMappa(fromPartial({}))

      expect(page.errors()).toEqual({
        managedByMappa: 'You must specify if the person is managed by MAPPA',
      })
    })
  })

  describe('response', () => {
    it('returns the response in human readable form', () => {
      const page = new ManagedByMappa(body)

      expect(page.response()).toEqual({
        'Is the person managed by MAPPA?': 'Yes',
      })
    })
  })
})
