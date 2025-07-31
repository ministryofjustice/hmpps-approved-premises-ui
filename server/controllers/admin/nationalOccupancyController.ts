import type { Request, Response, TypedRequestHandler } from 'express'
import {
  Cas1NationalOccupancy,
  Cas1Premises,
  Cas1SpaceBookingCharacteristic,
  Cas1SpaceCharacteristic,
} from '@approved-premises/api'
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
import { createQueryString, makeArrayOfType } from '../../utils/utils'
import { generateErrorMessages, generateErrorSummary } from '../../utils/validation'
import paths from '../../paths/admin'
import MultiPageFormManager from '../../utils/multiPageFormManager'
import { apTypeToSpaceCharacteristicMap } from '../../utils/apTypeLabels'
import { durationSelectOptions } from '../../utils/match/occupancy'
import { type Calendar, occupancyCalendar } from '../../utils/match/occupancyCalendar'
import { placementDates } from '../../utils/match'

export const defaultSessionKey = 'default'

interface IndexRequest extends Request {
  query: {
    fromDate: string
    arrivalDate: string
    apCriteria: Array<Cas1SpaceCharacteristic>
    roomCriteria: Array<Cas1SpaceCharacteristic>
  }
}

export default class NationalOccupancyController {
  formData: MultiPageFormManager<'nationalSpaceSearch'>

  constructor(
    private readonly premisesService: PremisesService,
    private readonly cruManagementAreaService: CruManagementAreaService,
  ) {
    this.formData = new MultiPageFormManager('nationalSpaceSearch')
  }

  index(): TypedRequestHandler<Request, Response> {
    return async (req: IndexRequest, res: Response) => {
      const {
        locals: {
          user: { cruManagementArea },
        },
      } = res
      const {
        user: { token },
        query,
      } = req

      let { fromDate } = query

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
      } = sessionData

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
        capacity = await this.premisesService.getMultipleCapacity(token, {
          cruManagementAreaIds: expandManagementArea(cruManagementAreas, apArea),
          fromDate,
          postcodeArea: postcode,
          premisesCharacteristics: (premisesCharacteristics || []).concat(apTypeToSpaceCharacteristicMap[apType] || []),
          roomCharacteristics,
        })
      }

      res.render('admin/nationalOccupancy/index', {
        pageHeading: 'View all Approved Premises spaces',
        backLink: paths.admin.cruDashboard.index({}),
        pagination: capacity && getPagination(fromDate),
        arrivalDate: rawArrivalDate || slashToday,
        processedCapacity: capacity && processCapacity(capacity, postcode, roomCriteria),
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

  premisesView(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const {
        user: { token },
        params: { premisesId },
        query,
      } = req

      const sessionData = this.formData.get(defaultSessionKey, req.session) || {}

      if (query.arrivalDate !== undefined) {
        Object.assign(sessionData, query, {
          roomCriteria: query.roomCriteria,
        })
      }

      const { arrivalDate: arrivalDateSlash, roomCriteria, durationDays = 84 } = sessionData
      const roomCharacteristics = makeArrayOfType<Cas1SpaceBookingCharacteristic>(roomCriteria || [])

      let calendar: Calendar
      let premises: Cas1Premises

      const arrivalDate = DateFormats.datepickerInputToIsoString(arrivalDateSlash)

      const errors: Record<string, string> = {}

      if (!isoDateIsValid(arrivalDate)) {
        errors.arrivalDate = 'Enter a valid arrival date'
      }

      if (!Object.keys(errors).length) {
        if (query.arrivalDate) {
          await this.formData.update(defaultSessionKey, req.session, sessionData)
        }
        premises = await this.premisesService.find(token, premisesId)
        const capacityDates = placementDates(arrivalDate, durationDays)
        const capacity = await this.premisesService.getCapacity(token, premisesId, {
          startDate: capacityDates.startDate,
          endDate: capacityDates.endDate,
        })

        const placeholderDetailsUrl = `${paths.admin.nationalOccupancy.premisesDayView({ premisesId, date: ':date' })}${createQueryString(
          { criteria: roomCharacteristics },
          {
            arrayFormat: 'repeat',
            addQueryPrefix: true,
          },
        )}`
        calendar = occupancyCalendar(capacity.capacity, placeholderDetailsUrl, roomCharacteristics)
      }

      return res.render('admin/nationalOccupancy/premises', {
        pageHeading: premises && `View spaces in ${premises.name}`,
        backLink: `${paths.admin.nationalOccupancy.weekView({})}?fromDate=${arrivalDate}`,
        premises,
        arrivalDate: arrivalDateSlash,
        durationOptions: durationSelectOptions(durationDays),
        criteriaOptions: convertKeyValuePairToCheckBoxItems(roomCharacteristicMap, roomCharacteristics),
        criteriaBlock: getCriteriaBlock(undefined, roomCharacteristics),
        calendar,
        errors: generateErrorMessages(errors),
        errorSummary: generateErrorSummary(errors),
      })
    }
  }
}
