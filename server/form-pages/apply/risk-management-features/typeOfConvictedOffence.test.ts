import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import applicationFactory from '../../../testutils/factories/application'
import personFactory from '../../../testutils/factories/person'
import TypeOfConvictedOffence, { offences } from './typeOfConvictedOffence'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'

jest.mock('../../../utils/formUtils')

describe('TypeOfConvictedOffence', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new TypeOfConvictedOffence({ offenceConvictions: 'some offence', something: 'else' }, application)

      expect(page.body).toEqual({ offenceConvictions: 'some offence' })
    })
  })

  itShouldHavePreviousValue(new TypeOfConvictedOffence({}, application), 'convicted-offences')

  itShouldHaveNextValue(new TypeOfConvictedOffence({}, application), 'date-of-offence')

  describe('errors', () => {
    it('should return an empty object if the offenceConvictions are populated', () => {
      const page = new TypeOfConvictedOffence({ offenceConvictions: 'some offence' }, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an error if the offenceConvictions are not populated', () => {
      const page = new TypeOfConvictedOffence({}, application)
      expect(page.errors()).toEqual({
        offenceConvictions: 'You must specify at least one type of offence',
      })
    })
  })

  describe('response', () => {
    describe('should return a translated version of the response', () => {
      it('When there are multiple convictions', () => {
        const page = new TypeOfConvictedOffence(
          { offenceConvictions: ['arson', 'sexualOffence', 'hateCrimes', 'childNonSexualOffence'] },
          application,
        )

        expect(page.response()).toEqual({
          'What type of offending has John Wayne been convicted of?': {
            Offences: 'Arson offences, Sexual offences, Hate crimes, Non-sexual offences against children',
          },
        })
      })
      it('When there is a single conviction', () => {
        const page = new TypeOfConvictedOffence({ offenceConvictions: 'arson' }, application)

        expect(page.response()).toEqual({
          'What type of offending has John Wayne been convicted of?': {
            Offences: 'Arson offences',
          },
        })
      })
    })
  })
  describe('items', () => {
    it('calls convertKeyValuePairToCheckBoxItems with the correct arguments', () => {
      new TypeOfConvictedOffence({ offenceConvictions: 'arson' }, application).items()
      expect(convertKeyValuePairToCheckBoxItems).toHaveBeenCalledWith(offences, 'arson')
    })
  })
})
