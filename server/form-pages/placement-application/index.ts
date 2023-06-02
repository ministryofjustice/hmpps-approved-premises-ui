/* istanbul ignore file */

import { Form } from '../utils/decorators'
import BaseForm from '../baseForm'
import RequestAPlacement from './request-a-placement'

@Form({ sections: [RequestAPlacement] })
export default class PlacementRequest extends BaseForm {}
