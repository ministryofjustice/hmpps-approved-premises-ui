import express, { Router } from 'express'
import { documentRender } from '../services/documentRender'

export default function setUpDocumentRender(): Router {
  const router = express.Router()

  router.post('/render-application', (req, res, next) => {
    res.json(documentRender(req.body))
  })

  return router
}
