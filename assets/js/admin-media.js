jQuery(function ($) {
  var frame;
  $('#pap_upload_image_btn').on('click', function (e) {
    e.preventDefault();
    if (frame) {
      frame.open();
      return;
    }
    frame = wp.media({
      title: '选择粒子图片',
      button: { text: '使用此图片' },
      multiple: false,
    });
    frame.on('select', function () {
      var attachment = frame.state().get('selection').first().toJSON();
      $('#pap_custom_image').val(attachment.url);
    });
    frame.open();
  });
});