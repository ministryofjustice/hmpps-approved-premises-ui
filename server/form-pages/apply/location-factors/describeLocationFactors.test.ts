import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import DescribeLocationFactors from './describeLocationFactors'

describe('ConvictedOffences', () => {
  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new DescribeLocationFactors({ postcodeArea: 'E17', something: 'else' })

      expect(page.body).toEqual({ postcodeArea: 'E17' })
    })
  })

  itShouldHavePreviousValue(new DescribeLocationFactors({}), '')
  itShouldHaveNextValue(new DescribeLocationFactors({}), '')

  describe('errors', () => {
    it('should ensure all required attributes are specified', () => {
      const page = new DescribeLocationFactors({})

      expect(page.errors()).toEqual({
        alternativeRadiusAccepted: 'You must specify if a placement in an alternative locality would be considered',
        differentPDU:
          "You must specify if the person is moving to a different area where they'll be managed by a different probation delivery unit",
        postcodeArea: 'You must specify a preferred postcode area for the placement',
        restrictions: 'You must specify if there are any restrictions linked to placement location',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const body = {
        postcodeArea: 'E17',
        positiveFactors: 'Positive Factors',
        restrictions: 'yes',
        restrictionDetail: 'Some restriction detail',
        alternativeRadiusAccepted: 'yes',
        alternativeRadius: '20',
        differentPDU: 'no',
      }

      const page = new DescribeLocationFactors(body)

      expect(page.response()).toEqual({
        'Give details of any positive factors for the person in this location.': 'Positive Factors',
        'What is the preferred location for the AP placement?': 'E17',
        'Are there any restrictions linked to placement location?': 'Yes',
        'Provide details of any restraining orders, exclusion zones, inclusion zones or other location based licence conditions.':
          'Some restriction detail',
        'If an AP Placement is not available in the persons preferred area, would a placement further away be considered?':
          'Yes',
        'Choose the maximum radius (in miles)': '20 miles',
        "Is the person moving to a different area where they'll be managed by a different probation delivery unit (PDU)?":
          'No',
      })
    })

    it('removes any blank responses', () => {
      const body = {
        postcodeArea: 'E17',
        positiveFactors: 'Positive Factors',
        restrictions: 'no',
        alternativeRadiusAccepted: 'no',
        differentPDU: 'no',
      }

      const page = new DescribeLocationFactors(body)

      expect(page.response()).toEqual({
        'Give details of any positive factors for the person in this location.': 'Positive Factors',
        'What is the preferred location for the AP placement?': 'E17',
        'Are there any restrictions linked to placement location?': 'No',
        'If an AP Placement is not available in the persons preferred area, would a placement further away be considered?':
          'No',
        "Is the person moving to a different area where they'll be managed by a different probation delivery unit (PDU)?":
          'No',
      })
    })
  })

  describe('radiusItems', () => {
    it('it calls convertKeyValuePairToRadioItems with a key/value pair of radiuses', () => {
      const page = new DescribeLocationFactors({ alternativeRadius: 90 })
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
