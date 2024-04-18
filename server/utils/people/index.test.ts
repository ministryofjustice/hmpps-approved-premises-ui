import { Request } from 'express'
import { crnErrorHandling } from './index'
import { RestrictedPersonError } from '../errors'
import { addErrorMessageToFlash } from '../validation'

jest.mock('../errors')
jest.mock('../validation')

describe('crnErrorHandling', () => {
  let req: Request

  beforeEach(() => {
    jest.resetAllMocks()
    req = {} as Request
    req.flash = jest.fn()
  })

  describe('restricted person error', () => {
    it('adds an error to the flash if the ', () => {
      const error = new RestrictedPersonError('SOME_CRN')
      error.type = 'RESTRICTED_PERSON'
      error.message = 'Some error message'
      const crn = 'SOME_CRN'

      crnErrorHandling(req, error, crn)

      expect(req.flash).toHaveBeenNthCalledWith(1, 'restrictedPerson', 'true')
      expect(addErrorMessageToFlash).toHaveBeenCalledWith(req, error.message, 'crn')
    })
  })

  describe('404 error', () => {
    it('should handle a 404 error', () => {
      const error = {
        data: {},
        status: 404,
      }
      const crn = 'SOME_CRN'

      crnErrorHandling(req, error, crn)

      expect(addErrorMessageToFlash).toHaveBeenCalledWith(req, `No person with an CRN of '${crn}' was found`, 'crn')
    })
  })

  describe('all other errors', () => {
    it('should throw an error for other types of errors', () => {
      const error = new Error('Some error')
      const crn = 'SOME_CRN'

      expect(() => crnErrorHandling(req, error, crn)).toThrow(error)
    })
  })
})
