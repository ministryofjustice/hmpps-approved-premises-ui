import { lowerCase } from '../../../../utils/utils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'
import CaseManagerInformation, { CaseManagerDetails, caseManagerKeys } from './caseManagerInformation'

describe('CaseMangerInformation', () => {
  const body: CaseManagerDetails = {
    name: 'Bob',
    emailAddress: 'bob@test.com',
    phoneNumber: '0123456789',
  }

  describe('body', () => {
    it('should set the body', () => {
      const page = new CaseManagerInformation(body)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHaveNextValue(new CaseManagerInformation(body), 'transgender')

  itShouldHavePreviousValue(new CaseManagerInformation(body), 'confirm-your-details')

  describe('errors', () => {
    describe.each(caseManagerKeys)('when the %s is not supplied', field => {
      it('should return an error', () => {
        const bodyWithoutField: Partial<CaseManagerDetails> = { ...body, [field]: undefined }
        const page = new CaseManagerInformation(bodyWithoutField)

        expect(page.errors()).toEqual({
          [field]: `You must enter the case manager's ${lowerCase(field)}`,
        })
      })
    })
  })

  describe('response', () => {
    it('returns the response in human readable form', () => {
      const page = new CaseManagerInformation(body)

      expect(page.response()).toEqual({
        'Case manager email': body.emailAddress,
        'Case manager name': body.name,
        'Case manager phone number': body.phoneNumber,
      })
    })
  })
})
