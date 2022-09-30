/* istanbul ignore file */

import promClient from 'prom-client'
import { createMetricsApp } from './monitoring/metricsApp'
import createApp from './app'
import { controllers } from './controllers'
import { services as sharedServices } from './services'
import { services as apServices } from './services/approved-premises'
import { services as taServices } from './services/temporary-accommodation'

promClient.collectDefaultMetrics()

const apServiceList = apServices()
const taServiceList = taServices()
const sharedServiceList = sharedServices()

const app = createApp(controllers(apServiceList, taServiceList), sharedServiceList)
const metricsApp = createMetricsApp()

export { app, metricsApp }
