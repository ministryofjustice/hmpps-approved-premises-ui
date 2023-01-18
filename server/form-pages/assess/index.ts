import { Form } from '../utils/decorators'
import BaseForm from '../baseForm'
import ReviewApplication from './reviewApplication'
import AssessApplication from './assessApplication'

@Form({ sections: [ReviewApplication, AssessApplication] })
export default class Assess extends BaseForm {}
