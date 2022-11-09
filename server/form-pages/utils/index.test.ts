import { applyYesOrNo } from './index'

describe('utils', () => {
  describe('applyYesOrNo', () => {
    it('returns a keypair of a yes/no answer and details', () => {
      const body = { foo: 'yes', fooDetail: 'Some Detail', something: 'else' }

      expect(applyYesOrNo('foo', body)).toEqual({ foo: 'yes', fooDetail: 'Some Detail' })
    })

    it('accepts a generic', () => {
      const body = { foo: 'yes', fooDetail: 'Some Detail', something: 'else' }

      expect(applyYesOrNo<'foo' | 'bar'>('foo', body)).toEqual({ foo: 'yes', fooDetail: 'Some Detail' })
    })
  })
})
