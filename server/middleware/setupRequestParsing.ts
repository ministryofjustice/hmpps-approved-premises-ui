import express, { Router } from 'express'
import trimInput from './trimInput'

export default function setUpWebRequestParsing(): Router {
  const router = express.Router()
  router.use(express.json())
  router.use(express.urlencoded({ extended: true, limit: '1mb', parameterLimit: 2500 }))
  router.use(trimInput())
  return router
}
