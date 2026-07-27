import {
  Cas1Application as Application,
  Cas1RequestsForPlacementDurationsCalculationResponseDto,
  SentenceTypeOption,
} from '@approved-premises/api'
import { DataServices } from '@approved-premises/ui'

const sentenceTypeFromApplication = (application: Application): SentenceTypeOption => {
  const basicInformation = application.data?.['basic-information']
  if (!basicInformation) return null

  const { sentenceType = '' } = {
    ...basicInformation['sentence-type'],
  }
  return sentenceType as SentenceTypeOption
}

export const getDefaultPlacementDurationInDays = async (
  application: Application,
  dataServices: DataServices,
  token: string,
): Promise<Cas1RequestsForPlacementDurationsCalculationResponseDto> =>
  dataServices.applicationService.getPlacementDuration(
    token,
    application.id,
    application.apType,
    sentenceTypeFromApplication(application),
  )
