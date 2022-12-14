import type { Request, Response, RequestHandler } from 'express'

import { PersonService } from '../../../services'

export default class DocumentsController {
  constructor(private readonly personService: PersonService) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, documentId } = req.params
      return this.personService.getDocument(req.user.token, crn, documentId, res)
    }
  }
}
