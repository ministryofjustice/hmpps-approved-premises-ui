import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { fromPartial } from '@total-typescript/shoehorn'
import PreferredAps from './preferredAps'
import { PremisesService } from '../../../../services'
import { applicationFactory, cas1PremisesSummaryFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

describe('PreferredAps', () => {
  let premisesService: DeepMocked<PremisesService>
  const application = applicationFactory.build()

  const ap1 = cas1PremisesSummaryFactory.build({ id: '1', name: 'AP 1' })
  const ap2 = cas1PremisesSummaryFactory.build({ id: '2', name: 'AP 2' })
  const ap3 = cas1PremisesSummaryFactory.build({ id: '3', name: 'AP 3' })
  const ap4 = cas1PremisesSummaryFactory.build({ id: '4', name: 'AP 4' })
  const ap5 = cas1PremisesSummaryFactory.build({ id: '5', name: 'AP 5' })

  const allAps = [ap1, ap2, ap3, ap4, ap5]

  const body = {
    preferredAp1: '1',
    preferredAp2: '2',
    preferredAp3: '3',
    preferredAp4: '4',
    preferredAp5: '5',
    selectedAps: allAps,
  }

  describe('body', () => {
    it('should set the body', () => {
      const page = new PreferredAps(body)

      expect(page.body).toEqual(body)
    })
  })

  describe('initialize', () => {
    const getCas1All = jest.fn().mockResolvedValue(allAps)
    const token = 'token'

    beforeEach(() => {
      premisesService = createMock<PremisesService>({
        getCas1All,
      })
    })

    it('should call the Premises service and set the list of Premises on the page class', async () => {
      const page = await PreferredAps.initialize(body, application, token, fromPartial({ premisesService }))

      expect(page.allPremises).toEqual(allAps)
      expect(getCas1All).toHaveBeenCalledWith(token, { gender: application.isWomensApplication ? 'woman' : 'man' })
    })

    it('should convert the selectedAps from strings to objects containing text and value properties', async () => {
      const page = await PreferredAps.initialize(
        { preferredAp1: '1', preferredAp2: '2' },
        application,
        token,
        fromPartial({
          premisesService,
        }),
      )

      expect(page.body.selectedAps).toEqual([ap1, ap2])
    })
  })

  itShouldHaveNextValue(new PreferredAps(body), '')
  itShouldHavePreviousValue(new PreferredAps(body), 'describe-location-factors')

  describe('response', () => {
    it('returns a human readable response for the selected 5 selected APs', () => {
      const page = new PreferredAps(body)

      page.allPremises = allAps
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

      page.allPremises = allAps
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
