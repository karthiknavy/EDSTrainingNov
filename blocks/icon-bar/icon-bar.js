// eslint-disable-next-line import/no-unresolved
$(document).ready(function() {
  setTimeout( function() {
    $('.icon-bar .button-container').each(function () {
      let $iconLink = $(this).find('a');
      let iconTxt = $iconLink.text();
      let iconTxtLower = iconTxt.toLowerCase();
      $iconLink.empty();
      $iconLink.append(iconTxtLower);
    })
  }, 10);
});