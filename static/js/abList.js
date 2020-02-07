var AbListModule = (function(){
  var $root
  var menuOffset = [];

  function init(){
    $root = $('.wrap');

    getMenuOffset();
    eventBind();
  }

  function eventBind() {
    $(document).on('scroll',$.throttle( 400, floatingSessionMenu ))
  }

  function getMenuOffset(){
    var target = $('.session_cnt_wrap');
    target.each(function(key,value){
      var eachTarget = $(this).offset().top
      var push_val = {'start':eachTarget,'end':eachTarget+($(this).height()-20)}
      menuOffset.push(push_val);
    })
    console.log(menuOffset);
  }

  function floatingSessionMenu(){
    console.log('test');
    var scroll_val = $(document).scrollTop()
    for (var i = 0; i < menuOffset.length; i++) {
      var theTarget = document.querySelectorAll('.session_cnt_wrap')[i]
      var menuTarget = theTarget.querySelector('.session_l_title')
      if (menuOffset[i].start<scroll_val && menuOffset[i].end>scroll_val) {//해당 메뉴가 보여야할 때;
        if (!theTarget.querySelector('.fixed-menu')) {
          menuTarget.classList.add('fixed-menu')
          menuTarget.nextElementSibling.style.margin = menuTarget.offsetHeight+'px 0 0 5%';
        }
      }else{
        theTarget.querySelector('.session_l_title').classList.remove('fixed-menu');
        menuTarget.nextElementSibling.style.margin = '0 0 0 5%';
      }
    }
  }

  function test(){

  }

  return {
    init : init
  };
})();
(function () {
    AbListModule.init();
})();
