import ReferToDelius from './referToDelius'

describe('ReferToDelius', () => {
  describe('title', () => {
    it('shold add the name of the person', () => {
      const page = new ReferToDelius({})

      expect(page.title).toEqual('Refer to nDelius to complete an Approved Premises (AP) application')
    })
  })
})
