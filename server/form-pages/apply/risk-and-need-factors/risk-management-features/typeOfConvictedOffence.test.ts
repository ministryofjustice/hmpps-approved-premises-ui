import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import TypeOfConvictedOffence, { offences } from './typeOfConvictedOffence'
import { convertKeyValuePairToCheckBoxItems } from '../../../../utils/formUtils'

jest.mock('../../../../utils/formUtils')

describe('TypeOfConvictedOffence', () => {
  describe('body', () => {
    it('should set attributes correctly', () => {
      const page = new TypeOfConvictedOffence({ offenceConvictions: 'arson' })

      expect(page.body).toEqual({ offenceConvictions: ['arson'] })
    })
  })

  itShouldHavePreviousValue(new TypeOfConvictedOffence({}), 'convicted-offences')

  itShouldHaveNextValue(new TypeOfConvictedOffence({}), 'date-of-offence')

  describe('errors', () => {
    it('should return an empty object if the offenceConvictions are populated', () => {
      const page = new TypeOfConvictedOffence({ offenceConvictions: ['arson'] })
      expect(page.errors()).toEqual({})
    })

    it('should return an error if the offenceConvictions are not populated', () => {
      const page = new TypeOfConvictedOffence({})
      expect(page.errors()).toEqual({
        offenceConvictions: 'You must specify at least one type of offence',
      })
    })
  })

  describe('response', () => {
    describe('should return a translated version of the response', () => {
      it('When there are multiple convictions', () => {
        const page = new TypeOfConvictedOffence({
          offenceConvictions: ['arson', 'sexualOffence', 'hateCrimes', 'childNonSexualOffence'],
        })

        expect(page.response()).toEqual({
          'What type of offending has the person been convicted of?':
            'Arson offences, Sexual offences, Hate crimes, Offences against children',
        })
      })

      it('When there is a single conviction', () => {
        const page = new TypeOfConvictedOffence({ offenceConvictions: 'arson' })

        expect(page.response()).toEqual({
          'What type of offending has the person been convicted of?': 'Arson offences',
        })
      })
    })
  })
  describe('items', () => {
    it('calls convertKeyValuePairToCheckBoxItems with the correct arguments', () => {
      new TypeOfConvictedOffence({ offenceConvictions: 'arson' }).items()
      expect(convertKeyValuePairToCheckBoxItems).toHaveBeenCalledWith(offences, ['arson'])
    })
  })
})
