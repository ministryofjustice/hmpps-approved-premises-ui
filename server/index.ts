/* istanbul ignore file */

import promClient from 'prom-client'
import { createMetricsApp } from './monitoring/metricsApp'
import createApp from './app'
import { controllers } from './controllers'
import { services as sharedServices } from './services'
import { services as apServices } from './services/approved-premises'

promClient.collectDefaultMetrics()

const apServiceList = apServices()
const sharedServiceList = sharedServices()

const app = createApp(controllers(apServiceList), sharedServiceList)
const metricsApp = createMetricsApp()

export { app, metricsApp }
