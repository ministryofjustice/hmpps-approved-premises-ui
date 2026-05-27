import { Form } from '../../utils/decorators'
import BaseForm from '../../baseForm'
import ManageProfile from './manage-profile'
import ContactResident from './contact-resident'

@Form({ sections: [ContactResident, ManageProfile] })
export default class PreArrival extends BaseForm {}
