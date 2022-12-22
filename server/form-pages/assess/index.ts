import { Form } from '../utils/decorators'
import BaseForm from '../baseForm'
import ReviewApplication from './reviewApplication'

@Form({ sections: [ReviewApplication] })
export default class Assess extends BaseForm {}
