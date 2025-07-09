import type { Request, RequestHandler, Response } from 'express'

import { Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import PremisesService from '../../../services/premisesService'
import paths from '../../../paths/manage'
import {
  bedActions,
  characteristicsSummary,
  bedsActions,
  bedsTableHeader,
  bedsTableRows,
  calculateBedCounts,
  filterBedsByCharacteristics,
  generateCharacteristicsLabels,
} from '../../../utils/bedUtils'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'
import { makeArrayOfType, pluralize } from '../../../utils/utils'
import { generateCharacteristicsSummary } from '../../../utils/premises/occupancy'

export default class BedsController {
  constructor(private readonly premisesService: PremisesService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        user: { token },
        params: { premisesId },
        query,
      } = req

      const filterCharacteristics = makeArrayOfType<Cas1SpaceBookingCharacteristic>(query.characteristics)

      const [premises, beds] = await Promise.all([
        this.premisesService.find(token, premisesId),
        this.premisesService.getBeds(token, premisesId),
      ])

      const filteredBeds = filterBedsByCharacteristics(beds, filterCharacteristics)

      return res.render('manage/premises/beds/index', {
        backLink: paths.premises.show({ premisesId }),
        premises,
        pageHeading: 'Manage beds',
        actions: bedsActions(premisesId, req.session.user),
        tableRows: bedsTableRows(filteredBeds, premisesId),
        tableHeader: bedsTableHeader(),
        characteristicOptions: convertKeyValuePairToCheckBoxItems(
          generateCharacteristicsLabels(calculateBedCounts(beds)),
          filterCharacteristics,
        ),
        tableCaption: `Showing ${pluralize('bed', filteredBeds.length)}${generateCharacteristicsSummary(filterCharacteristics, ` that ${filteredBeds.length === 1 ? 'is' : 'are'} `)}`,
      })
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params

      const backLink = paths.premises.beds.index({ premisesId })
      const [premises, bed] = await Promise.all([
        this.premisesService.find(req.user.token, premisesId),
        this.premisesService.getBed(req.user.token, premisesId, req.params.bedId),
      ])

      return res.render('manage/premises/beds/show', {
        backLink,
        bed,
        premises,
        pageHeading: `Bed ${bed.name}`,
        actions: bedActions(bed, premisesId, req.session.user),
        characteristicsSummaryList: characteristicsSummary(bed.characteristics),
      })
    }
  }
}
