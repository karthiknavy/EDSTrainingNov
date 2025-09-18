// eslint-disable-next-line import/no-unresolved
$(document).ready(function() {
  setTimeout( function() {
    $('.icon-bar .button-container').each(function () {
      let $iconLink = $(this).find('a');
      let iconTxt = $iconLink.text();
      let iconTxtLower = iconTxt.toLowerCase();
      console.log(iconTxtLower);
      $iconLink.empty();
      $iconLink.append('<i class"fa ' + iconTxtLower + '"></i>')
    })
  }, 200);
});