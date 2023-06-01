import NotEligible from './notEligible'

describe('NotEligible', () => {
  describe('title', () => {
    it('should return the title', () => {
      const page = new NotEligible({})

      expect(page.title).toEqual('This application is not eligible')
    })
  })
})
