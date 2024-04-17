import type { Request } from 'express'
import { HttpError } from 'http-errors'
import { RestrictedPersonError } from '../errors'
import { addErrorMessageToFlash } from '../validation'
import { Person } from '../../@types/shared'

export const crnErrorHandling = (req: Request, error: unknown, crn: Person['crn']) => {
  const knownError = error as RestrictedPersonError | HttpError | Error

  if ('type' in knownError && knownError.type === 'RESTRICTED_PERSON') {
    req.flash('restrictedPerson', 'true')
    addErrorMessageToFlash(req, knownError.message, 'crn')
  } else if ('data' in knownError && knownError.status === 404) {
    addErrorMessageToFlash(req, `No person with an CRN of '${crn}' was found`, 'crn')
  } else {
    throw knownError
  }
}
