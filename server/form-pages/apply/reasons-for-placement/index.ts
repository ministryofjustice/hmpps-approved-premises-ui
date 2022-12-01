import { Section } from '../../utils/decorators'

import BasicInformation from './basic-information'
import TypeOfAp from './type-of-ap'

@Section({ name: 'Reasons for placement', tasks: [BasicInformation, TypeOfAp] })
export default class ReasonsForPlacement {}
