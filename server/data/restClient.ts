/* istanbul ignore file */

import { Readable } from 'stream'
import superagent from 'superagent'
import Agent, { HttpsAgent } from 'agentkeepalive'
import { Response } from 'express'

import logger from '../../logger'
import sanitiseError from '../sanitisedError'
import { ApiConfig } from '../config'
import type { UnsanitisedError } from '../sanitisedError'
import { restClientMetricsMiddleware } from './restClientMetricsMiddleware'
import { createQueryString } from '../utils/utils'
import { PaginatedResponse } from '../@types/ui'
import { userVersionMiddleware } from './userVersionMiddleware'

interface GetRequest {
  path?: string
  query?: string | Record<string, string>
  headers?: Record<string, string>
  responseType?: string
  raw?: boolean
}

interface PostRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  data?: Record<string, unknown>
  raw?: boolean
}

type PutRequest = PostRequest

type PatchRequest = PostRequest

interface StreamRequest {
  path?: string
  headers?: Record<string, string>
  errorLogger?: (e: UnsanitisedError) => void
}

interface PipeRequest {
  path?: string
  query?: string | Record<string, string>
  headers?: Record<string, string>
  errorLogger?: (e: UnsanitisedError) => void
  passThroughHeaders?: Array<string>
}

export default class RestClient {
  agent: Agent

  defaultHeaders: Record<string, string>

  constructor(
    private readonly name: string,
    private readonly config: ApiConfig,
    private readonly token: string,
  ) {
    this.agent = config.url.startsWith('https') ? new HttpsAgent(config.agent) : new Agent(config.agent)
    this.defaultHeaders = config.serviceName ? { 'X-SERVICE-NAME': config.serviceName } : {}
  }

  private apiUrl() {
    return this.config.url
  }

  private timeoutConfig() {
    return this.config.timeout
  }

  async get({ path = '', query = '', headers = {}, responseType = '', raw = false }: GetRequest): Promise<unknown> {
    logger.info(`Get using user credentials: calling ${this.name}: ${path} ${query}`)
    try {
      const result = await superagent
        .get(`${this.apiUrl()}${path}`)
        .agent(this.agent)
        .use(restClientMetricsMiddleware)
        .use(userVersionMiddleware)
        .retry(2, (err, res) => {
          if (res && res.statusCode === 503) {
            logger.info('Received 503, Not retrying')
            return false
          }
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .query(query)
        .auth(this.token, { type: 'bearer' })
        .set({ ...this.defaultHeaders, ...headers })
        .responseType(responseType)
        .timeout(this.timeoutConfig())
      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error as UnsanitisedError)
      logger.warn({ ...sanitisedError, query }, `Error calling ${this.name}, path: '${path}', verb: 'GET'`)
      throw sanitisedError
    }
  }

  async post(request: PostRequest = {}): Promise<unknown> {
    return this.postOrPutOrPatch('post', request)
  }

  async put(request: PutRequest = {}): Promise<unknown> {
    return this.postOrPutOrPatch('put', request)
  }

  async patch(request: PatchRequest = {}): Promise<unknown> {
    return this.postOrPutOrPatch('patch', request)
  }

  async delete(path: string): Promise<unknown> {
    logger.info(`Delete using user credentials: calling ${this.name}: ${path}`)
    try {
      const result = await superagent
        .delete(`${this.apiUrl()}${path}`)
        .agent(this.agent)
        .use(restClientMetricsMiddleware)
        .use(userVersionMiddleware)
        .auth(this.token, { type: 'bearer' })
        .set({ ...this.defaultHeaders })
        .timeout(this.timeoutConfig())

      return result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error as UnsanitisedError)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'DELETE'`)
      throw sanitisedError
    }
  }

  async stream({ path = '', headers = {} }: StreamRequest = {}): Promise<unknown> {
    logger.info(`Get using user credentials: calling ${this.name}: ${path}`)
    return new Promise((resolve, reject) => {
      superagent
        .get(`${this.apiUrl()}${path}`)
        .agent(this.agent)
        .auth(this.token, { type: 'bearer' })
        .use(restClientMetricsMiddleware)
        .use(userVersionMiddleware)
        .retry(2, (err, res) => {
          if (res && res.statusCode === 503) {
            logger.info('Received 503, Not retrying')
            return false
          }
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .timeout(this.timeoutConfig())
        .set({ ...this.defaultHeaders, ...headers })
        .end((error, response) => {
          if (error) {
            logger.warn(sanitiseError(error), `Error calling ${this.name}`)
            reject(error)
          } else if (response) {
            const s = new Readable()
            // eslint-disable-next-line no-underscore-dangle,no-empty-function
            s._read = () => {}
            s.push(response.body)
            s.push(null)
            resolve(s)
          }
        })
    })
  }

  async pipe(
    { path = '', query = '', headers = {}, passThroughHeaders = [] }: PipeRequest,
    response: Response,
  ): Promise<void> {
    logger.info(`Get using user credentials: calling ${this.name}: ${path}`)
    return new Promise((resolve, reject) => {
      const stream = superagent
        .get(`${this.apiUrl()}${path}`)
        .agent(this.agent)
        .auth(this.token, { type: 'bearer' })
        .use(restClientMetricsMiddleware)
        .use(userVersionMiddleware)
        .retry(2, (err, res) => {
          if (res && res.statusCode === 503) {
            logger.info('Received 503, Not retrying')
            return false
          }
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .query(query)
        .timeout(this.timeoutConfig())
        .set({ ...this.defaultHeaders, ...headers })

      stream.on('end', () => {
        resolve()
      })

      stream.on('response', res => {
        if (res.status !== 200) {
          logger.warn(res.error, `Error calling ${this.name}`)
          stream.abort()
          reject(res.error)
        }
        passThroughHeaders.forEach(header => {
          response.set(header, res.headers[header])
        })
      })

      stream.pipe(response)
    })
  }

  async getPaginatedResponse<T>({
    path = '',
    page = '',
    query = {},
  }: {
    path: string
    page: string
    query: Record<string, unknown>
  }): Promise<PaginatedResponse<T>> {
    const response = (await this.get({
      path,
      query: createQueryString({ page, ...query }),
      raw: true,
    })) as superagent.Response

    return {
      data: response.body,
      pageNumber: page,
      totalPages: response.headers['x-pagination-totalpages'],
      totalResults: response.headers['x-pagination-totalresults'],
      pageSize: response.headers['x-pagination-pagesize'],
    }
  }

  private async postOrPutOrPatch(
    method: 'post' | 'put' | 'patch',
    { path = '', headers = {}, responseType = '', data = {}, raw = false }: PutRequest | PostRequest = {},
  ): Promise<unknown> {
    logger.info(`${method} using user credentials: calling ${this.name}: ${path}`)
    try {
      const request = superagent[method](`${this.apiUrl()}${path}`)

      const result = await request
        .send(this.filterBlanksFromData(data))
        .agent(this.agent)
        .use(restClientMetricsMiddleware)
        .use(userVersionMiddleware)
        .auth(this.token, { type: 'bearer' })
        .set({ ...this.defaultHeaders, ...headers })
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error as UnsanitisedError)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: '${method}'`)
      throw sanitisedError
    }
  }

  private filterBlanksFromData(data: Record<string, unknown>): Record<string, unknown> {
    Object.keys(data).forEach(k => typeof data[k] !== 'boolean' && !data[k] && delete data[k])

    return data
  }
}
