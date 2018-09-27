function loadFonts({
  baseURL,
  fonts
}) {
  var newStyle = document.createElement('style');
  var downloadBase = baseURL + '/download/public/';
  fonts.items.forEach(function (item) {
    var textNode = {};
    if (item.attachment_id) {
      textNode = document.createTextNode(`\
      @font-face {\
          font-family: '` + item.name + `';\
          src: url('` + downloadBase + item.attachment_id + `')\
      }\
      `)
    } else {
      textNode = document.createTextNode(`\
      @font-face {\
          font-family: '` + item.name + `';\
      }\
      `)
    }
    newStyle.appendChild(textNode);
  }.bind(this))
  var self = this;
  newStyle.addEventListener('load', function () {
    WebFont.load({
      custom: {
        families: fonts.items.map(function (item) {
          return item.name;
        })
      },
      active: function () {
        fontsActivated = true;
      }
    });
  });
  document.head.appendChild(newStyle);
}