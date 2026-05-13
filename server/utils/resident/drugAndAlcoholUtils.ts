import { Cas1OASysGroup } from '@approved-premises/api'
import { card, insetText } from '.'
import { summaryCards } from './riskUtils'
import { ApiOutcome } from '../utils'

export const drugAndAlcoholCards = (supportingInformation: Cas1OASysGroup, supportingInformationResult: ApiOutcome) => [
  card({ html: insetText('Imported from OASys') }),
  ...summaryCards(['8.9', '9.9'], supportingInformation, supportingInformationResult),
]
