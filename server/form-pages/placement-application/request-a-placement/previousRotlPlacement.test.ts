import { fromPartial } from '@total-typescript/shoehorn'
import { itShouldHavePreviousValue } from '../../shared-examples'

import PreviousRotlPlacement, { Body } from './previousRotlPlacement'
import { DateFormats } from '../../../utils/dateUtils'

describe('PreviousRotlPlacement', () => {
  const body = {
    previousRotlPlacement: 'yes',
    lastAp: 'An AP',
    details: 'Some Summary',
    'lastPlacementDate-year': '2023',
    'lastPlacementDate-month': '12',
    'lastPlacementDate-day': '1',
  } as Body

  describe('body', () => {
    it('should set the body', () => {
      const page = new PreviousRotlPlacement(body)

      expect(page.body).toEqual({
        previousRotlPlacement: 'yes',
        lastAp: 'An AP',
        details: 'Some Summary',
        'lastPlacementDate-year': '2023',
        'lastPlacementDate-month': '12',
        'lastPlacementDate-day': '1',
        lastPlacementDate: '2023-12-01',
      })
    })
  })

  itShouldHavePreviousValue(new PreviousRotlPlacement(body), 'reason-for-placement')

  describe('next', () => {
    describe('if there has been a previous ROTL placementment', () => {
      it('returns same-ap', () => {
        const page = new PreviousRotlPlacement(body)
        expect(page.next()).toEqual('same-ap')
      })
    })
    describe('if there has not been a previous ROTL placementment', () => {
      it('returns dates-of-placement', () => {
        const page = new PreviousRotlPlacement({ ...body, previousRotlPlacement: 'no' })
        expect(page.next()).toEqual('dates-of-placement')
      })
    })
  })

  describe('errors', () => {
    it('should return an empty object if the body is provided correctly', () => {
      const page = new PreviousRotlPlacement(body)
      expect(page.errors()).toEqual({})
    })

    it('should return errors if previousRotlPlacement is blank', () => {
      const page = new PreviousRotlPlacement(fromPartial({}))
      expect(page.errors()).toEqual({
        previousRotlPlacement:
          'You must state if the person has previously had a placement at an Approved Premises for ROTL',
      })
    })

    it('should return errors if previousRotlPlacement is yes and the required fields are blank', () => {
      const page = new PreviousRotlPlacement({
        ...body,
        'lastPlacementDate-year': '',
        'lastPlacementDate-month': '',
        'lastPlacementDate-day': '',
        lastAp: '',
        details: '',
      })
      expect(page.errors()).toEqual({
        details:
          'You must provide details of any other previous ROT placements (including the location) and dates of stays.',
        lastAp: 'You must provide the name of the last Approved Premises the person stayed at',
        'lastPlacementDate-day': 'You must provide the date of the last placement',
      })
    })

    it('should return errors if the last placement date is invalid', () => {
      const page = new PreviousRotlPlacement({
        ...body,
        'lastPlacementDate-year': '99999',
        'lastPlacementDate-month': '99999',
        'lastPlacementDate-day': '199999',
      })
      expect(page.errors()).toEqual({
        'lastPlacementDate-day': 'The placement date is invalid',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new PreviousRotlPlacement(body)

      expect(page.response()).toEqual({
        'Has this person previously had a placement at an Approved Premises for ROTL?': 'Yes',
        'Provide details of any other previous ROTL placements (including the location) and dates of stays.':
          'Some Summary',
        'When was the last placement?': DateFormats.dateAndTimeInputsToUiDate(body, 'lastPlacementDate'),
        'Which Approved Premises did the person last stay at?': 'An AP',
      })
    })
  })
})
