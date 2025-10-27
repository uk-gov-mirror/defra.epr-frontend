import fetch from 'node-fetch'

import { config } from '#config/config.js'

/**
 * @satisfies {Partial<ServerRoute>}
 */
export const registrationController = {
  async handler(request, h) {
    const { organisationId, registrationId } = request.params

    const baseUrl = config.get('eprBackendUrl')

    const url = `${baseUrl}/v1/organisations/${organisationId}`

    const response = await fetch(url)
    const { accreditations, registrations } = await response.json()

    const registration = registrations.find(({ id }) => id === registrationId)
    const accreditation = accreditations.find(
      ({ id }) => id === registration.accreditationId
    )

    return h.view('registration/index', {
      pageTitle: 'Registration', // @todo use activity/site/material info
      heading: 'Registration',
      organisationId,
      registrationId,
      registration,
      accreditation
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
