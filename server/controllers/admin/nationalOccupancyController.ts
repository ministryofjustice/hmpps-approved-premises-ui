import type { Request, Response, TypedRequestHandler } from 'express'
import { Cas1SpaceBookingCharacteristic, Cas1SpaceCharacteristic } from '@approved-premises/api'
import { CruManagementAreaService } from '../../services'
import { DateFormats, isoDateIsValid } from '../../utils/dateUtils'
import { getManagementAreaSelectGroups } from '../../utils/admin/nationalOccupancyUtils'
import { apTypeLongLabels } from '../../utils/apTypeLabels'
import { convertKeyValuePairToCheckBoxItems } from '../../utils/formUtils'
import { roomCharacteristicMap } from '../../utils/characteristicsUtils'
import { spaceSearchCriteriaApLevelLabels } from '../../utils/match/spaceSearchLabels'
import { makeArrayOfType } from '../../utils/utils'
import { generateErrorMessages, generateErrorSummary } from '../../utils/validation'
import paths from '../../paths/admin'

export default class NationalOccupancyController {
  constructor(private readonly cruManagementAreaService: CruManagementAreaService) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const {
        locals: {
          user: { cruManagementArea },
        },
      } = res
      const {
        user: { token },
        query: { postcodeArea, arrivalDate: rawArrivalDate, apArea, apType, roomCharacteristics, apCharacteristics },
      } = req
      const errors: Record<string, string> = {}

      const slashToday = DateFormats.isoDateToUIDate(DateFormats.dateObjToIsoDate(new Date()), { format: 'datePicker' })

      const cruManagementAreas = await this.cruManagementAreaService.getCruManagementAreas(token)
      const arrivalDate = rawArrivalDate || slashToday

      if (!isoDateIsValid(DateFormats.datepickerInputToIsoString(arrivalDate as string))) {
        errors.arrivalDate = 'Invalid arrival date'
      }
      if (postcodeArea && !/^[A-Z]{1,2}[0-9]{1,2}[A-Z]?$/i.test(postcodeArea as string)) {
        errors.postcodeArea = 'Invalid postcode area'
      }

      res.render('admin/nationalOccupancy/index', {
        pageHeading: 'View all Approved Premises spaces',
        backLink: paths.admin.cruDashboard.index({}),
        arrivalDate,
        postcodeArea: postcodeArea || '',
        cruManagementAreaOptions: getManagementAreaSelectGroups(
          cruManagementAreas,
          apArea as string,
          cruManagementArea?.id,
        ),
        apTypes: Object.entries(apTypeLongLabels).map(([id, name]) => ({ id, name })),
        apType,
        roomCharacteristics: convertKeyValuePairToCheckBoxItems(
          roomCharacteristicMap,
          makeArrayOfType<Cas1SpaceBookingCharacteristic>(roomCharacteristics),
        ),
        apCharacteristics: convertKeyValuePairToCheckBoxItems(
          spaceSearchCriteriaApLevelLabels,
          makeArrayOfType<Cas1SpaceCharacteristic>(apCharacteristics),
        ),
        errors: generateErrorMessages(errors),
        errorSummary: generateErrorSummary(errors),
      })
    }
  }
}
