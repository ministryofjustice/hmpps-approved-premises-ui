import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from './testutils/appSetup'
import AuditService, { Page } from '../services/auditService'
import ExampleService from '../services/exampleService'

jest.mock('../services/auditService')
jest.mock('../services/exampleService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const exampleService = new ExampleService(null) as jest.Mocked<ExampleService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      auditService,
      exampleService,
    },
    userSupplier: () => user,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should render index page', () => {
    auditService.logPageView.mockResolvedValue(null)
    exampleService.getExampleData.mockResolvedValue('some example data')

    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('This site is under construction...')
        expect(res.text).toContain('some example data')
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.EXAMPLE_PAGE, {
          who: user.username,
          correlationId: expect.any(String),
        })
        expect(exampleService.getExampleData).toHaveBeenCalled()
      })
  })

  it('service errors are handled', () => {
    auditService.logPageView.mockResolvedValue(null)
    exampleService.getExampleData.mockRejectedValue(new Error('Some problem calling external api!'))

    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Some problem calling external api!')
      })
  })
})
