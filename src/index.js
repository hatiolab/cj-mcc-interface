import { fetch } from 'whatwg-fetch'
import 'url-polyfill'
import 'url-search-params-polyfill'
import { SceneIntegrator } from '@things-scene/things-board-integration'

export function init({
  baseURL = 'http://localhost:9001/rest',
  queryString,
  authorizationKey,
  license
}) {
  var fit = 'both' // 'both', 'ratio', 'center', 'none'

  var authorizationType = 'token'

  var searchParams
  if (queryString) searchParams = new URLSearchParams(queryString)

  var center = searchParams.get('center')
  var zone = searchParams.get('zone').toLowerCase()
  var token = searchParams.get('token')

  authorizationKey = token || authorizationKey

  var apiURL = new URL(`/rest/scene_mcc_mappings/${center}/${zone}`, baseURL)

  var header = {
    'Content-Type': 'application/json',
    'Authorization-Type': authorizationType,
    'Authorization-Key': authorizationKey
  }

  var options = {
    method: 'GET',
    headers: header,
    credentials: 'include',
    mode: 'cors'
  }

  fetch(apiURL, options)
    .then(response => {
      var contentType = response.headers.get('content-type')
      if (contentType && contentType.indexOf('application/json') !== -1) {
        response.json().then(function (json) {
          var integrator = SceneIntegrator.instance({
            authorizationKey,
            withCredentials: true,
            baseURL,
            fit,
            license
          })

          integrator.integrate({
            target: 'scene-viewer',
            sceneName: json.scene_name
          })
        })
      }
    })
    .catch(error => {
      console.error('Error!!!', error)
    })
}
