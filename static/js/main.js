var MainModule = (function(){
  var $root
  function init(){
    $root = $('.wrap');

    eventBind();
  }

  function eventBind(){
    //select에 필요한 event들
    $root.on('click','.select_trigger',openSelect);
    $root.on('click','.option_cnt',selectOption)
    $root.on('click','.js-showPop',showPop)
    $('body').on('click','.pop_btn-x span',hidePop)
  }
  function setSelect(){
    var theTarget = $('.option_wrap .selected');
    if (theTarget.length>0) {
      var this_text = theTarget.text();
      var this_val = theTarget.attr('data-value');
      var changeTarget = theTarget.closest('.select_wrap').find('.select_trigger span')
      changeTarget.text(this_text)
      changeTarget.attr('data-value',this_val);
      changeTarget.removeClass('select_placeholder');
    }
  }
  function openSelect(){
    var $this = $(this);
    var parentTarget = $this.closest('.select_wrap');
    if ($this.hasClass('open')) {
      $this.removeClass('open')
      parentTarget.find('.option_wrap').hide();
    }else{
      $this.addClass('open')
      parentTarget.find('.option_wrap').show();
    }
  }
  function selectOption(){
    var $this = $(this);
    var parentTarget = $this.closest('.select_wrap');
    parentTarget.find('.option_wrap .option_cnt').removeClass('selected');
    $this.addClass('selected');
    parentTarget.find('.select_trigger span').text($this.text());
    parentTarget.find('.select_trigger span').removeClass('select_placeholder');
    parentTarget.find('.select_trigger span').attr('data-value',$this.attr('data-value'))
    parentTarget.find('.select_trigger').removeClass('open');
    parentTarget.find('.option_wrap').hide();
  }

  function getSomeUrl(text){
    var web_url = location.href
    web_url = web_url.split('?').pop().split('=');
    var tmp_web_url = [];
    for (var i = 0; i < web_url.length; i++) {
      var is_temp = web_url[i].split('&');
      tmp_web_url = tmp_web_url.concat(is_temp);
    }
    if (Number(tmp_web_url.indexOf(text)!=-1)) {
      var returnId = tmp_web_url[Number(tmp_web_url.indexOf(text)) + 1]
      return returnId
    }else{
      return ''
    }
  }

  function showPop(){
    document.querySelector('.pop_bg').style.display = "block";
    document.querySelector('.pop_wrap').style.display = "block";
  }

  function hidePop(){
    $('.pop_bg').fadeOut(300);
    $('.pop_wrap').fadeOut(300) //모바일 touch 때문에 넣음
    document.body.style.overflow = 'auto';
  }

  function showPopHeightVertical(){
    var el = document.querySelector('.pop_wrap')
    document.querySelector('.pop_bg').style.display = 'block';
    el.style.display = "block"
    el.style.visibility = "hidden"
    el.style.margin = (($(window).height()-$(".pop_wrap").outerHeight())/2+$(window).scrollTop()) + 'px 0 0 0';
    el.style.visibility = 'visible'
  }

  function getLocalStorage(){
    var lang_val = localStorage.getItem('lang');
    if (lang_val==null) {
      lang_val = 'ko'
      localStorage.setItem('lang','ko');
    }
    return lang_val
  }
  function getColorLocalStorage(){
    return  JSON.parse(localStorage.getItem('color_code'));
  }

  return {
    init : init,
    getSomeUrl : getSomeUrl,
    setSelect : setSelect,
    showPop : showPop,
    hidePop : hidePop,
    getLocalStorage : getLocalStorage,
    getColorLocalStorage : getColorLocalStorage,
    showPopHeightVertical : showPopHeightVertical
  };
})();
(function () {
    MainModule.init();
})();
