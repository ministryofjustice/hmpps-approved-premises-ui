import { DeepMocked, createMock } from '@golevelup/ts-jest'

import PreferredAps from './preferredAps'
import { PremisesService } from '../../../../services'
import { applicationFactory, premisesFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

describe('PreferredAps', () => {
  let premisesService: DeepMocked<PremisesService>
  const application = applicationFactory.build()

  const ap1 = premisesFactory.build({ id: '1', name: 'AP 1' })
  const ap2 = premisesFactory.build({ id: '2', name: 'AP 2' })
  const ap3 = premisesFactory.build({ id: '3', name: 'AP 3' })
  const ap4 = premisesFactory.build({ id: '4', name: 'AP 4' })
  const ap5 = premisesFactory.build({ id: '5', name: 'AP 5' })

  const aps = [ap1, ap2, ap3, ap4, ap5, { name: 'No preference', id: 'no-preference' }]

  const body = {
    preferredAp1: '1',
    preferredAp2: '2',
    preferredAp3: '3',
    preferredAp4: '4',
    preferredAp5: '5',
    selectedAps: aps.map(ap => ({ value: ap.id, text: ap.name })),
  }

  describe('body', () => {
    it('should set the body and uppercase the postcode', () => {
      const page = new PreferredAps(body)

      expect(page.body).toEqual(body)
    })
  })

  describe('initialize', () => {
    const getAll = jest.fn().mockResolvedValue([{ value: '1', text: 'Premises 1' }])
    const token = 'token'

    beforeEach(() => {
      premisesService = createMock<PremisesService>({
        getAll,
      })
    })

    it('should call the Premises service and set the list of Premises on the page class', async () => {
      const page = await PreferredAps.initialize(body, application, token, { premisesService })

      expect(page.allPremises).toEqual([{ value: '1', text: 'Premises 1' }])
      expect(getAll).toHaveBeenCalledWith(token)
    })

    it('should convert the selectedAps from strings to objects containing text and value properties', async () => {
      const page = await PreferredAps.initialize({ ...body, selectedAps: ['1'] }, application, token, {
        premisesService,
      })

      expect(page.selectedAps).toEqual([{ value: '1', text: 'Premises 1' }])
    })
  })

  itShouldHaveNextValue(new PreferredAps(body), '')
  itShouldHavePreviousValue(new PreferredAps(body), 'describe-location-factors')

  describe('response', () => {
    it('returns a human readable response for the selected 5 selected APs', () => {
      const page = new PreferredAps(body)

      page.allPremises = aps
      expect(page.response()).toEqual({
        'First choice AP': 'AP 1',
        'Second choice AP': 'AP 2',
        'Third choice AP': 'AP 3',
        'Fourth choice AP': 'AP 4',
        'Fifth choice AP': 'AP 5',
      })
    })

    it('returns a human readable response for the selected APs when only 1 is selected', () => {
      const page = new PreferredAps({
        ...body,
        preferredAp1: '1',
        preferredAp2: 'no-preference',
        preferredAp3: 'no-preference',
        preferredAp4: 'no-preference',
        preferredAp5: 'no-preference',
      })

      page.allPremises = aps
      expect(page.response()).toEqual({
        'First choice AP': 'AP 1',
        'Second choice AP': 'No preference',
        'Third choice AP': 'No preference',
        'Fourth choice AP': 'No preference',
        'Fifth choice AP': 'No preference',
      })
    })
  })

  describe('errors', () => {
    it('should return an error if there isnt a first preference AP selected', () => {
      expect(new PreferredAps({}).errors()).toEqual({ preferredAp1: 'You must select one preferred Approved Premises' })
    })
  })
})
