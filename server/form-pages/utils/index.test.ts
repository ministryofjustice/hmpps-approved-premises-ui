import { applyYesOrNo, yesOrNoResponseWithDetail, yesNoOrDontKnowResponseWithDetail } from './index'

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

  describe('yesOrNoResponseWithDetail', () => {
    it('returns a response with detail if the answer is yes', () => {
      const body = { foo: 'yes', fooDetail: 'Some Detail' }

      expect(yesOrNoResponseWithDetail('foo', body)).toEqual('Yes - Some Detail')
    })

    it('returns no detail if the answer is no', () => {
      const body = { foo: 'no' }

      expect(yesOrNoResponseWithDetail('foo', body)).toEqual('No')
    })
  })

  describe('yesNoOrDontKnowResponseWithDetail', () => {
    it('returns a response with detail if the answer is yes', () => {
      const body = { foo: 'yes', fooDetail: 'Some Detail' }

      expect(yesNoOrDontKnowResponseWithDetail('foo', body)).toEqual('Yes - Some Detail')
    })

    it('returns No if the answer is no', () => {
      const body = { foo: 'no' }

      expect(yesNoOrDontKnowResponseWithDetail('foo', body)).toEqual('No')
    })

    it("returns Don't know if the answer is iDontKnow", () => {
      const body = { foo: 'iDontKnow' }

      expect(yesNoOrDontKnowResponseWithDetail('foo', body)).toEqual("Don't know")
    })
  })
})
