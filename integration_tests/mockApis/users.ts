import { ApprovedPremisesUser as User } from '@approved-premises/api'
import { stubFor } from '../../wiremock'
import paths from '../../server/paths/api'

const stubFindUser = (args: { user: User; id: string }) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: paths.users.show({ id: args.id }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: args.user,
    },
  })

export default { stubFindUser }
