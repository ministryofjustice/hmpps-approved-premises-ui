import { YesOrNo } from '@approved-premises/ui'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'

import Arson from './arson'

jest.mock('../../../../utils/applications/shouldShowContingencyPlanPages')

describe('Arson', () => {
  const body = {
    arson: 'yes' as YesOrNo,
    arsonDetail: 'Arson detail',
  }

  describe('body', () => {
    it('should set the body', () => {
      const page = new Arson(body)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHaveNextValue(new Arson(body), 'additional-circumstances')
  itShouldHavePreviousValue(new Arson(body), 'catering')

  describe('errors', () => {
    it('should return errors when yes/no questions are blank', () => {
      const page = new Arson({})

      expect(page.errors()).toEqual({
        arson: 'You must specify if the person poses an arson risk',
      })
    })

    it('shows errors when a question has a yes response, but the details are left out', () => {
      const page = new Arson({ ...body, arsonDetail: '' })

      expect(page.errors()).toEqual({
        arsonDetail: 'You must specify details if the person poses an arson risk',
      })
    })
  })

  describe('response', () => {
    it('Adds detail to an answer when the answer is yes', () => {
      const page = new Arson(body)

      expect(page.response()).toEqual({
        'Does the person pose an arson risk?': 'Yes - Arson detail',
      })
    })

    it('does not add detail to questions with a no answer', () => {
      const page = new Arson({ ...body, arson: 'no' })

      expect(page.response()).toEqual({
        'Does the person pose an arson risk?': 'No',
      })
    })
  })
})
