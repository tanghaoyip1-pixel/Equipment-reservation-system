import ApiError from '@/services/api/api-error'
import { auth } from '@/stores/auth'
import { config } from '@/config'
import axios from 'axios'

export async function operation(
  method: string,
  uri: string,
  data?: any,
  headers?: Record<string, string>,
) {
  try {
    await renewAccessToken()
    const headersWithAuth = { ...authorizationHeader(), ...headers }
    const response = await makeRequest(method, uri, data, headersWithAuth)
    await checkResponse(response)
    return response
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 401) {
      await auth.logout()
    } else {
      throw e
    }
  }
}

async function checkResponse(res: any) {
  if (res.status === 401) {
    throw new ApiError(401, 'User is not logged in.', res)
  } else if (res.status === 403) {
    throw new ApiError(
      403,
      'User does not have sufficient permissions.',
      res,
    )
  } else if (res.status === 404) {
    throw new ApiError(404, 'Target object does not exist.', res)
  } else if (res.status === 409) {
    throw new ApiError(409, null, res)
  } else if (res.status >= 304) {
    const message =
      res.method === 'get' ? 'Failed to load data.' : 'Failed to save data.'
    throw new ApiError(res.status, message, res)
  }
}

const authorizationHeader = (): Record<string, string> =>
  auth.isAuthenticated && auth.token.value
    ? { Authorization: 'Bearer ' + auth.token.value }
    : {}

async function renewAccessToken() {
  if (!auth.isAuthenticated) {
    return
  }
  try {
    await auth.renewToken()
  } catch (e) {
    throw new ApiError(401, 'Could not renew access token', e)
  }
}

async function makeRequest(
  method: string,
  uri: string,
  data?: any,
  headers?: Record<string, string>,
) {
  return await axios
    .create({
      validateStatus: () => true,
    })
    .request({
      method: method,
      url: config.serverUrl + uri,
      data: data,
      headers: headers,
    })
}
