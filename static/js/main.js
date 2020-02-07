var MainModule = (function(){
  var $root
  function init(){
    $root = $('.wrap');

    setSelect() //d이걸 나중에 select option 채운 다음으로 옮기기
    eventBind();
  }

  function eventBind(){
    //select에 필요한 event들
    $root.on('click','.select_trigger',openSelect);
    $root.on('click','.option_cnt',selectOption)
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

  return {
    init : init
  };
})();
(function () {
    MainModule.init();
})();
