import PauseApplication from './pauseApplication'

describe('PauseApplication', () => {
  describe('title', () => {
    it('shold add the name of the person', () => {
      const page = new PauseApplication({})

      expect(page.title).toEqual('Application paused')
    })
  })
})
