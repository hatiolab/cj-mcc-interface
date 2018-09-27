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

  var interval = data["polling-interval"]
  var variables = data["variables"]

  board.data = variables

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





  // var xhr = new XMLHttpRequest();

  // var headers = {
  //   "Content-Type": 'application/json',
  //   "Authorization-Type": 'token',
  //   "Authorization-Key": 'tokenuser'
  // }

  // xhr.open('GET', pubUrl, true);
  // // xhr.onloadend = callback;
  // xhr.onreadystatechange = function (aEvt) {
  //   if (xhr.readyState == 4) {
  //     if (xhr.status == 200) {
  //       var data = typeof xhr.response === 'string' ? JSON.parse(xhr.response) : xhr.response;
  //       return data
  //     }
  //     else
  //       console.warn(error);
  //   }
  // };
  // // xhr.ontimeout = timeout;
  // xhr.withCredentials = true;
  // xhr.responseType = 'json';
  // xhr.timeout = 30000;

  // for (var header in headers)
  //   xhr.setRequestHeader(header, headers[header]);

  // xhr.send();
}