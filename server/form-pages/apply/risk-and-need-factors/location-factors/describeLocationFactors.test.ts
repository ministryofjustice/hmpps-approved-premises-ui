import { YesOrNo } from '@approved-premises/ui'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'

import DescribeLocationFactors from './describeLocationFactors'

describe('DescribeLocationFactors', () => {
  describe('body', () => {
    it('should set the body and uppercase the postcode', () => {
      const page = new DescribeLocationFactors({ postcodeArea: 'e17' })

      expect(page.body).toEqual({ postcodeArea: 'E17' })
    })

    it('should remove the radius if alternativeRadiusAccepted is no', () => {
      const page = new DescribeLocationFactors({
        postcodeArea: 'E17',
        alternativeRadiusAccepted: 'no',
        alternativeRadius: '60',
      })

      expect(page.body).toEqual({ postcodeArea: 'E17', alternativeRadiusAccepted: 'no' })
    })

    it('should not remove the radius if alternativeRadiusAccepted is yes', () => {
      const page = new DescribeLocationFactors({
        postcodeArea: 'E17',
        alternativeRadiusAccepted: 'yes',
        alternativeRadius: '60',
      })

      expect(page.body).toEqual({ postcodeArea: 'E17', alternativeRadiusAccepted: 'yes', alternativeRadius: '60' })
    })
  })

  itShouldHavePreviousValue(new DescribeLocationFactors({}), 'dashboard')
  itShouldHaveNextValue(new DescribeLocationFactors({}), 'preferred-aps')

  describe('errors', () => {
    it('should ensure all required attributes are specified', () => {
      const page = new DescribeLocationFactors({})

      expect(page.errors()).toEqual({
        alternativeRadiusAccepted: 'You must specify if a placement in an alternative locality would be considered',
        postcodeArea: 'You must specify a preferred postcode area for the placement',
        restrictions: 'You must specify if there are any restrictions linked to placement location',
      })
    })

    it('should show an error if the postcode area is invalid', () => {
      const page = new DescribeLocationFactors({ postcodeArea: 'Not a postcode area' })

      const errors = page.errors()

      expect(errors.postcodeArea).toEqual('The preferred postcode area must be a valid postcode area (i.e SW1A)')
    })

    it('should show an error if restrictions is yes, but no detail is provided', () => {
      const page = new DescribeLocationFactors({ restrictions: 'yes' })

      const errors = page.errors()

      expect(errors.restrictionDetail).toEqual(
        'You must provide details of any restrictions linked to placement location',
      )
    })

    it('should show an error if an alternative radius is required', () => {
      const page = new DescribeLocationFactors({ alternativeRadiusAccepted: 'yes' })

      const errors = page.errors()

      expect(errors.alternativeRadius).toEqual('You must choose an alternative radius')
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const body = {
        postcodeArea: 'E17',
        positiveFactors: 'Positive Factors',
        restrictions: 'yes' as YesOrNo,
        restrictionDetail: 'Some restriction detail',
        alternativeRadiusAccepted: 'yes' as YesOrNo,
        alternativeRadius: '60' as const,
      }

      const page = new DescribeLocationFactors(body)

      expect(page.response()).toEqual({
        'Give details of why this postcode area would benefit the person': 'Positive Factors',
        'What is the preferred postcode area for the Approved Premises (AP) placement?': 'E17',
        'Are there any restrictions linked to placement location?': 'Yes',
        'Upload any exclusion zone maps to NDelius. You cannot upload these to the service.': 'Some restriction detail',
        'If an AP Placement is not available in the persons preferred area, would a placement further away be considered?':
          'Yes',
        'Choose the maximum radius (in miles)': '60 miles',
      })
    })

    it('removes any blank responses', () => {
      const body = {
        postcodeArea: 'E17',
        positiveFactors: 'Positive Factors',
        restrictions: 'no' as YesOrNo,
        alternativeRadiusAccepted: 'no' as YesOrNo,
      }

      const page = new DescribeLocationFactors(body)

      expect(page.response()).toEqual({
        'Give details of why this postcode area would benefit the person': 'Positive Factors',
        'What is the preferred postcode area for the Approved Premises (AP) placement?': 'E17',
        'Are there any restrictions linked to placement location?': 'No',
        'If an AP Placement is not available in the persons preferred area, would a placement further away be considered?':
          'No',
      })
    })
  })

  describe('radiusItems', () => {
    it('it calls convertKeyValuePairToRadioItems with a key/value pair of radiuses', () => {
      const page = new DescribeLocationFactors({ alternativeRadius: '90' })
      page.radiusItems()

      expect(page.radiusItems()).toEqual([
        { key: '60 miles', value: '60' },
        { key: '70 miles', value: '70' },
        { key: '80 miles', value: '80' },
        { key: '90 miles', value: '90' },
        { key: '100 miles', value: '100' },
        { key: '110 miles', value: '110' },
        { key: '120 miles', value: '120' },
        { key: '130 miles', value: '130' },
        { key: '140 miles', value: '140' },
        { key: '150 miles', value: '150' },
      ])
    })
  })
})
