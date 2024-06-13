import { test } from '../../test'
import { createApplication } from '../../steps/apply'
import { requestAndAddAdditionalInformation } from '../../steps/assess'

test('Request further information on an Application, adds it and proceeds with the assessment', async ({
  page,
  user,
  person,
  oasysSections,
}) => {
  const id = await createApplication({ page, person, oasysSections, applicationType: 'standard' }, false)
  await requestAndAddAdditionalInformation({ page, user, person }, id)
})
