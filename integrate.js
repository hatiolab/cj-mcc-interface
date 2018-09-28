function integrate({
  baseURL, authorizationType, authorizationKey, license = ThingsLicense, sceneName, target, callback = afterSceneLoaded
}) {
  var integrator = SceneIntegrator.instance({
    authorizationType,
    authorizationKey,
    withCredentials: true,
    baseURL: baseURL,
    fit: fit,
    license: license,
    // modelAccessor: '',
    urlBuilder: function (baseURL, boardName) {
      // return baseURL + '/models/' + boardName + ".json";
      return baseURL + '/scenes/' + boardName;
    }
  });

  integrator.integrate({
    target: target,
    sceneName: sceneName,
    callback: callback.bind(this, {
      sceneName,
      baseURL,
      authorizationKey,
      authorizationType
    })
  });
}

function afterSceneLoaded({
  sceneName,
  baseURL,
  authorizationKey,
  authorizationType
}, board, e) {

  if (e) {
    console.trace(e.message);
    return
  }

  startDataGethering({
    sceneName,
    baseURL,
    authorizationKey,
    authorizationType
  }, board);

  window.addEventListener('resize', function () {
    board.fit(fit, board);
  })
}

async function startDataGethering({
  sceneName,
  baseURL,
  authorizationKey,
  authorizationType
}, board) {
  var data = await getInitData({
    sceneName,
    baseURL,
    authorizationKey,
    authorizationType
  })

  var mode = data["provider-mode"]
  var interval = data["polling-interval"]
  var variables = data["variables"]

  board.data = variables

  if(mode == 'S') {
    var stompClient = initStomp({
      url: new URL(`/elidom/stomp`, baseURL).toString(),
      onConnected: () => {
        startSubscribe(stompClient, sceneName, board)
      }
    })
    return
  }

  setTimeout(() => {
    startDataGethering({
      sceneName,
      baseURL,
      authorizationKey,
      authorizationType
    }, board)
  }, interval)

}

async function getInitData({
  sceneName,
  baseURL,
  authorizationKey,
  authorizationType
}) {

  var pubUrl = baseURL + '/publishers/' + sceneName + '/init_data'

    var header = new Headers();
    header.append("Content-Type", "application/json");
    header.append("Authorization-Type", authorizationType);
    header.append("Authorization-Key", authorizationKey);

    var options = {
      method: "GET",
      headers: header,
      credentials: 'include',
      mode: 'cors'
    }

    return await fetch(pubUrl, options).then(async (response)=> {
      var contentType = response.headers.get("content-type");
      if(contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json().then(async json => {
          return json
        });
      }
    }).catch(error => {
      console.error('Error!!!', error)
    })
}