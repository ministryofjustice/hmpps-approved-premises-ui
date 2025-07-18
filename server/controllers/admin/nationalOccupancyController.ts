import type { Request, Response, TypedRequestHandler } from 'express'
import { Cas1SpaceBookingCharacteristic, Cas1SpaceCharacteristic } from '@approved-premises/api'
import { NationalSpaceSearchFormData } from '@approved-premises/ui'
import { CruManagementAreaService } from '../../services'
import { DateFormats, isoDateIsValid } from '../../utils/dateUtils'
import { getApTypeOptions, getManagementAreaSelectGroups } from '../../utils/admin/nationalOccupancyUtils'
import { convertKeyValuePairToCheckBoxItems, validPostcodeArea } from '../../utils/formUtils'
import { roomCharacteristicMap } from '../../utils/characteristicsUtils'
import { spaceSearchCriteriaApLevelLabels } from '../../utils/match/spaceSearchLabels'
import { makeArrayOfType } from '../../utils/utils'
import { generateErrorMessages, generateErrorSummary } from '../../utils/validation'
import paths from '../../paths/admin'
import MultiPageFormManager from '../../utils/multiPageFormManager'

export const defaultSessionKey = 'default'

export default class NationalOccupancyController {
  formData: MultiPageFormManager<'nationalSpaceSearch'>

  constructor(private readonly cruManagementAreaService: CruManagementAreaService) {
    this.formData = new MultiPageFormManager('nationalSpaceSearch')
  }

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const {
        locals: {
          user: { cruManagementArea },
        },
      } = res
      const {
        user: { token },
        query,
      } = req

      const sessionData = this.formData.get(defaultSessionKey, req.session) || {}
      const combinedQuery = { ...sessionData, ...query }

      const {
        postcode,
        arrivalDate: rawArrivalDate,
        apArea,
        apType,
        roomCriteria,
        apCriteria,
      } = combinedQuery as NationalSpaceSearchFormData

      const errors: Record<string, string> = {}

      const slashToday = DateFormats.isoDateToUIDate(DateFormats.dateObjToIsoDate(new Date()), { format: 'datePicker' })

      const cruManagementAreas = await this.cruManagementAreaService.getCruManagementAreas(token)
      const arrivalDate = rawArrivalDate || slashToday

      if (!isoDateIsValid(DateFormats.datepickerInputToIsoString(arrivalDate as string))) {
        errors.arrivalDate = 'Enter a valid arrival date'
      }
      if (postcode && !validPostcodeArea(postcode)) {
        errors.postcode = 'Enter a valid postcode area'
      }

      if (!errors.length) {
        await this.formData.update(defaultSessionKey, req.session, combinedQuery)
      }

      res.render('admin/nationalOccupancy/index', {
        pageHeading: 'View all Approved Premises spaces',
        backLink: paths.admin.cruDashboard.index({}),
        arrivalDate,
        postcode: postcode || '',
        cruManagementAreaOptions: getManagementAreaSelectGroups(
          cruManagementAreas,
          apArea as string,
          cruManagementArea?.id,
        ),
        roomCriteria: convertKeyValuePairToCheckBoxItems(
          roomCharacteristicMap,
          makeArrayOfType<Cas1SpaceBookingCharacteristic>(roomCriteria),
        ),
        apCriteria: convertKeyValuePairToCheckBoxItems(
          spaceSearchCriteriaApLevelLabels,
          makeArrayOfType<Cas1SpaceCharacteristic>(apCriteria),
        ),
        apTypeOptions: getApTypeOptions(apType),
        errors: generateErrorMessages(errors),
        errorSummary: generateErrorSummary(errors),
      })
    }
  }
}
