import type { Request, RequestHandler, Response } from 'express'

import PersonService from '../services/personService'
import { addErrorMessageToFlash } from '../utils/validation'
import { supportEmail } from '../utils/phaseBannerUtils'

export default class PeopleController {
  constructor(private readonly personService: PersonService) {}

  find(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, checkCaseload, checkOasys, checkNoms } = req.body

      if (crn) {
        try {
          const person = await this.personService.findByCrn(req.user.token, crn, !!checkCaseload)
          req.flash('crn', person.crn)
        } catch (err) {
          if ('data' in err && err.status === 404) {
            addErrorMessageToFlash(req, `No person with an CRN of '${crn}' was found`, 'crn')
          } else if (checkCaseload && err.status === 403) {
            addErrorMessageToFlash(req, `The CRN '${crn}' is not in your caseload`, 'crn')
          } else if (err.status === 500) {
            if (err?.data?.detail === 'No OASys present for CRN' && checkOasys) {
              addErrorMessageToFlash(
                req,
                `The CRN '${crn}' does not have an OASys record. Email AP Service Support (${supportEmail}) with the person's name and CRN for help starting an AP application.`,
                'crn',
              )
            } else if (err?.data?.detail === 'No nomsNumber present for CRN' && checkNoms) {
              addErrorMessageToFlash(
                req,
                `The CRN '${crn}' does not have a NOMS number. Email AP Service Support (${supportEmail}) with the person's name and CRN for help starting an AP application.`,
                'crn',
              )
            }
          } else {
            throw err
          }
        }
      } else {
        addErrorMessageToFlash(req, 'You must enter a CRN', 'crn')
      }
      res.redirect(req.headers.referer)
    }
  }
}
