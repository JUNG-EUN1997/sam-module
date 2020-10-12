var IndexModule = (function(){
  var $root
  var MODULE_ID;
  var LANG_TYPE;
  var MEMBER_ID;
  var USER_ID;
  var USER_EMAIL;
  var SORT_TYPE;
  var INOWING_ADMIN;

  var ALERT_TXT_KO = ['유저 정보를 찾을 수 없습니다.','잘못된 접근입니다.','로그인 후 이용하실 수 있는 서비스입니다.']
  var ALERT_TXT_EN = ['Not found user info.','It\'s a wrong approach.','You can use it after logging in.']
  var ALERT_TXT_USE = []
  function init(){
    $root = $('.wrap');

    MODULE_ID = MainModule.getSomeUrl('id')
    MEMBER_ID = MainModule.getSomeUrl('m_id')
    USER_ID = MainModule.getSomeUrl('user_id')
    USER_EMAIL = MainModule.getSomeUrl('email')
    LANG_TYPE = MainModule.getSomeUrl('lang')
    SORT_TYPE = MainModule.getSomeUrl('sort_type')
    INOWING_ADMIN = MainModule.getSomeUrl('inowing_admin')
    INOWING_ADMIN = (INOWING_ADMIN=='') ? '' : INOWING_ADMIN;
    USER_ID = (USER_ID=='') ? '' : USER_ID;
    USER_EMAIL = (USER_EMAIL=='') ? '' : USER_EMAIL;
    LANG_TYPE = (LANG_TYPE=='') ? 'ko' : LANG_TYPE;
    SORT_TYPE = (SORT_TYPE=='') ? '0' : SORT_TYPE;
    localStorage.setItem('sort_type',SORT_TYPE);

    if (INOWING_ADMIN=='1') {
      setLangLocalStorage()
      location.href = './ab.html?id='+MODULE_ID+'&m_id='+MEMBER_ID
    }

    if (LANG_TYPE=="en") {
      ALERT_TXT_USE = ALERT_TXT_EN;
    }else{
      ALERT_TXT_USE = ALERT_TXT_KO;
    }

    if (MEMBER_ID=='' || MODULE_ID=='') {
      alert(ALERT_TXT_USE[1]);
      return false;
    }
    localStorage.removeItem('date');
    localStorage.removeItem('scroll_value');
    isLoginUser()
  }

  function isLoginUser(){
    var dataObj = {
      "member_id":MEMBER_ID,
      "user_id":USER_ID,
      "email":USER_EMAIL
    }
    var settings = {
        "async": true,
        "url": "/api/v1/sam/is_logged_for_sam",
        "method": "GET",
        "data": dataObj,
        "headers": {
            "accept": "application/json"
        }
    }

    $.ajax(settings).done(function (response) {
      setLangLocalStorage()
      if(SORT_TYPE == 2){
        location.href = './speaker_list.html?id='+MODULE_ID+'&m_id='+MEMBER_ID
      }else{
        location.href = './ab.html?id='+MODULE_ID+'&m_id='+MEMBER_ID
      }
      // if (SORT_TYPE==0) {
      //   location.href = './ab.html?id='+MODULE_ID+'&m_id='+MEMBER_ID
      // }else{
      //   location.href = './ab_category.html?id='+MODULE_ID+'&m_id='+MEMBER_ID
      // }

    }).fail(function(response){
      if (response.status==411) {
        alert(ALERT_TXT_USE[0])
      }else if(response.status==401){
        alert(ALERT_TXT_USE[2]);
      }else{
        alert('ERROR CODE::'+response.status);
      }
    });
  }


  function setLangLocalStorage(){
    if (LANG_TYPE.indexOf('en')!=-1) {
      LANG_TYPE = 'en'
    }else{
      LANG_TYPE = 'ko'
    }
    localStorage.setItem('lang',LANG_TYPE);
  }

  return {
    init : init
  };
})();
(function () {
    IndexModule.init();
})();
