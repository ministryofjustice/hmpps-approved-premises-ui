import type { Request, Response, TypedRequestHandler } from 'express'
import { Cas1NationalOccupancy, Cas1SpaceBookingCharacteristic, Cas1SpaceCharacteristic } from '@approved-premises/api'
import { NationalSpaceSearchFormData } from '@approved-premises/ui'
import { CruManagementAreaService, PremisesService } from '../../services'
import { DateFormats, isoDateIsValid } from '../../utils/dateUtils'
import {
  expandManagementArea,
  getApTypeOptions,
  getManagementAreaSelectGroups,
  getPagination,
  processCapacity,
  getCriteriaBlock,
  getDateHeader,
} from '../../utils/admin/nationalOccupancyUtils'
import { convertKeyValuePairToCheckBoxItems, validPostcodeArea } from '../../utils/formUtils'
import { roomCharacteristicMap } from '../../utils/characteristicsUtils'
import { spaceSearchCriteriaApLevelLabels } from '../../utils/match/spaceSearchLabels'
import { makeArrayOfType } from '../../utils/utils'
import { catchAPIErrorOrPropogate, generateErrorMessages, generateErrorSummary } from '../../utils/validation'
import paths from '../../paths/admin'
import MultiPageFormManager from '../../utils/multiPageFormManager'

export const defaultSessionKey = 'default'

export default class NationalOccupancyController {
  formData: MultiPageFormManager<'nationalSpaceSearch'>

  constructor(
    private readonly premisesService: PremisesService,
    private readonly cruManagementAreaService: CruManagementAreaService,
  ) {
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

      let { fromDate } = query as { fromDate: string }

      const sessionData = this.formData.get(defaultSessionKey, req.session) || {}

      if (query.arrivalDate !== undefined) {
        Object.assign(sessionData, query, {
          apCriteria: query.apCriteria,
          roomCriteria: query.roomCriteria,
        })
        fromDate = DateFormats.datepickerInputToIsoString(query.arrivalDate as string)
      }

      const {
        postcode: rawPostcode,
        arrivalDate: rawArrivalDate,
        apArea,
        apType,
        roomCriteria,
        apCriteria,
      } = sessionData as NationalSpaceSearchFormData

      const premisesCharacteristics = makeArrayOfType<Cas1SpaceCharacteristic>(apCriteria || [])
      const roomCharacteristics = makeArrayOfType<Cas1SpaceCharacteristic>(roomCriteria || [])

      const errors: Record<string, string> = {}

      const slashToday = DateFormats.isoDateToUIDate(DateFormats.dateObjToIsoDate(new Date()), { format: 'datePicker' })

      const cruManagementAreas = await this.cruManagementAreaService.getCruManagementAreas(token)
      const postcode = rawPostcode && rawPostcode.toUpperCase()

      if (
        query.arrivalDate !== undefined &&
        !isoDateIsValid(DateFormats.datepickerInputToIsoString(rawArrivalDate as string))
      ) {
        errors.arrivalDate = 'Enter a valid arrival date'
      }

      if (postcode && !validPostcodeArea(postcode)) {
        errors.postcode = 'Enter a valid postcode area'
      }

      if (!Object.keys(errors).length) {
        await this.formData.update(defaultSessionKey, req.session, sessionData)
      }

      let capacity: Cas1NationalOccupancy

      if (fromDate && !Object.keys(errors).length) {
        try {
          capacity = await this.premisesService.getMultipleCapacity(token, {
            cruManagementAreaIds: expandManagementArea(cruManagementAreas, apArea),
            fromDate,
            postcodeArea: postcode,
            premisesCharacteristics,
            roomCharacteristics,
          })
        } catch (error) {
          catchAPIErrorOrPropogate(req, res, error)
        }
      }

      res.render('admin/nationalOccupancy/index', {
        pageHeading: 'View all Approved Premises spaces',
        backLink: paths.admin.cruDashboard.index({}),
        pagination: capacity && getPagination(fromDate),
        arrivalDate: rawArrivalDate || slashToday,
        processedCapacity: capacity && processCapacity(capacity, postcode, apType),
        dateHeader: capacity && getDateHeader(capacity),
        postcode: postcode || '',
        cruManagementAreaOptions: getManagementAreaSelectGroups(
          cruManagementAreas,
          apArea as string,
          cruManagementArea?.id,
        ),
        roomCriteria: convertKeyValuePairToCheckBoxItems(roomCharacteristicMap, roomCharacteristics),
        apCriteria: convertKeyValuePairToCheckBoxItems(spaceSearchCriteriaApLevelLabels, premisesCharacteristics),
        apTypeOptions: getApTypeOptions(apType),
        fromDate,
        criteriaBlock: getCriteriaBlock(premisesCharacteristics, roomCharacteristics),
        errors: generateErrorMessages(errors),
        errorSummary: generateErrorSummary(errors),
      })
    }
  }
}
