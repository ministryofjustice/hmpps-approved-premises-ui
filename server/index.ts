import createApp from './app'
import { services } from './services'
import { controllers } from './controllers'

const serviceList = services()
const app = createApp(controllers(serviceList), serviceList)

export default app
