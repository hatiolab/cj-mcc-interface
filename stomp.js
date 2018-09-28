function initStomp({
  url,
  onConnected
}) {
  var socket = new SockJS(url);
  var client = Stomp.over(socket);

  client.connect({}, function (frame) {
    console.log('connected')
    if(onConnected && typeof onConnected == 'function') {
      onConnected.call()
    }
  });

  return client

}

function startSubscribe(client, sceneName, board) {
  client.subscribe(`/elidom/stomp/topic/hatiolab-hq/smart/${sceneName}`, message => {
    console.log("message received", message)
    var variables = JSON.parse(message.body);

    if (!variables)
      return

    // 요청이 오기전에 다른 Route로 이동한 경우
    if (!board)
      return

    if(variables instanceof Array)
      variables.forEach(variable => board.data = variable)
    else
      board.data = variables;
  }) 
}