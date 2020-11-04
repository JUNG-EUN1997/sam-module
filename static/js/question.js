var QuestionModule = (function(){
  var $root
  var SAM_ID;
  var SESSION_NAME;
  var MODULE_ID;
  var LANG_TYPE;
  var MEMBER_ID;
  var ALERT_TXT_KO = ['로그인 후 이용하실 수 있는 서비스입니다.','코드번호를 입력해주세요.','해당 발표자를 찾을 수 없습니다.','해당 모듈을 찾을 수 없습니다.','잘못된 코드입니다.','질문을 입력해주세요. (최대 500자까지 입력이 가능합니다.)','질문 대상을 선택해주세요.','제출이 완료되었습니다.'];
  var ALERT_TXT_EN = ['You can use it after logging in.','Please enter the code.','not found the speaker.','not found the module.','wrong code.','Please write a question. (You can enter up to 500 characters.)','Please select the target to question.','The question has been submitted.'];
  var ALERT_TXT_USE = []
  var COLOR_CODE = ['x','메인색상','메인색상내부글자색상','RGB색상'];
  function init(){
    $root = $('.wrap');
    MODULE_ID = MainModule.getSomeUrl('id')
    SAM_ID = MainModule.getSomeUrl('s_id')
    MEMBER_ID = MainModule.getSomeUrl('m_id')
    SESSION_NAME = unescape(MainModule.getSomeUrl('name'));
    SESSION_NAME = (SESSION_NAME=='') ? false : SESSION_NAME;
    LANG_TYPE = MainModule.getLocalStorage()
    ALERT_TXT_USE = ALERT_TXT_KO
    COLOR_CODE = MainModule.getColorLocalStorage();
    if (LANG_TYPE=='en') {
      document.querySelector('.btn-pop_submit').innerHTML = 'Close'
      if (document.querySelector('#btnShowList')!=null) {
        document.querySelector('#btnShowList').innerHTML = 'Show question list'
      }else{
        $('#content').attr('placeholder',ALERT_TXT_EN[5])
      }
      ALERT_TXT_USE = ALERT_TXT_EN
    }
    setColorStyle();
    getSamSpeakerList();
    eventBind();
  }

  function setColorStyle(){
    var style_code = '.ic_select{border-top-color:'+COLOR_CODE[1]+';}'
    style_code += '.btn-submit{background-color:'+COLOR_CODE[1]+'; color:'+COLOR_CODE[2]+';}'
    $('body').prepend('<style>'+style_code+'</style>');
  }

  function eventBind(){
    $root.on('click','#btnAdmin',locationQuestionList)
    $root.on('click','#postQuestion',postQuestion);
  }

  function getSamSpeakerList(){
    var dataObj = {
      "module_id": MODULE_ID
    }
    var settings = {
      "async": true,
      "url": "/api/v1/sam/"+SAM_ID+"/get_speaker_list",
      "method": "GET",
      "data":dataObj,
      "headers": {
          "accept": "application/json"
      }
    }
    $.ajax(settings).done(function (response) {
      var optionHtml =''

      if (SESSION_NAME=='') {
        var option_a = './question_write.html?id='+MODULE_ID+'&s_id='+SAM_ID+'&name=ALL&m_id='+MEMBER_ID
        optionHtml = '<a href="javascript:QuestionModule.locationReplace(\''+option_a+'\')"><span class="option_cnt" data-value="ALL" data-value_en="ALL">ALL</span></a>'
      }else{
        var is_all_select = ''
        if (SESSION_NAME=='ALL') {
          is_all_select+=' selected'
        }
        optionHtml = '<span class="option_cnt'+is_all_select+'" data-value="ALL" data-value_en="ALL">ALL</span>'
      }
      var select_arr = [' selected']
      var number = 0;
      for (var i = 0; i < response.length; i++) {
        var pushHtml = ''
        var use_response_val = response[i].speaker_name;
        if (LANG_TYPE=='en') {
          use_response_val = response[i].speaker_name_en;
        }
        var url_name = escape(use_response_val)
        var a_url = './question_write.html?id='+MODULE_ID+'&s_id='+SAM_ID+'&name='+url_name+'&m_id='+MEMBER_ID
        var a_html = '<a href="javascript:QuestionModule.locationReplace(\''+a_url+'\');">'
        // "./question_write.html?id='+MODULE_ID+'&s_id='+SAM_ID+'&name='+url_name+'&m_id='+MEMBER_ID+'"
        var is_selelct = (SESSION_NAME === use_response_val) ? ((select_arr[number]!=undefined)? select_arr[number] : '') : ''
        number = (SESSION_NAME === use_response_val) ? number+1 : number
        if (SESSION_NAME=='') {
          pushHtml = a_html + '<span class="option_cnt'+is_selelct+'" data-value="'+response[i].speaker_name+'" data-value_en="'+response[i].speaker_name_en+'">'+use_response_val+'</span>' + '</a>'
        }else{
          pushHtml = '<span class="option_cnt'+is_selelct+'" data-value="'+response[i].speaker_name+'" data-value_en="'+response[i].speaker_name_en+'">'+use_response_val+'</span>'
        }
        optionHtml  += pushHtml
      }
      document.querySelector('.option_wrap').innerHTML = optionHtml
      if (SESSION_NAME!='') {
        MainModule.setSelect()
      }
    }).fail(function(){
      alert(ALERT_TXT_USE[0])
    });
  }

  function locationQuestionList(){
    var code = document.querySelector('#codeInput')
    if (code.value=='') {
      alert(ALERT_TXT_USE[1]);
      code.focus();
      return false
    }
    var dataObj = {
      "session_talk_code":code.value,
      "module_id":MODULE_ID
    }
    var settings = {
      "async": true,
      "url": "/api/v1/sam/"+SAM_ID+"/get_session_talk_list",
      "method": "GET",
      "data":dataObj,
      "headers": {
          "accept": "application/json"
      }
    }
    $.ajax(settings).done(function (response) {
      location.href ='./question_list.html?id='+MODULE_ID+'&s_id='+SAM_ID+'&code='+code.value
    }).fail(function(response){
      if (response.status==410) {
        alert('Validation error')
      }else if(response.status==411){
        alert(ALERT_TXT_USE[2])
      }else if(response.status==412){
        alert(ALERT_TXT_USE[3])
      }else if(response.status==413){
        alert(ALERT_TXT_USE[4]);
      }
      code.value = '';
      MainModule.hidePop();
    });
  }

  function postQuestion(){
    var content = document.querySelector('#content');
    var sel_val = document.querySelector('.select_trigger span');
    if (content.value=='') {
      document.querySelector('.h1-pop_title').innerHTML = ALERT_TXT_USE[5]
      MainModule.showPopHeightVertical();
      document.body.style.overflow = 'hidden';
      content.focus();
      return false;
    }else if(sel_val.textContent=='' || sel_val.textContent==undefined){
      document.querySelector('.h1-pop_title').innerHTML = ALERT_TXT_USE[6]
      MainModule.showPopHeightVertical();
      document.body.style.overflow = 'hidden';
      $(document).scrollTop(0);
      return false;
    }
    var post_speaker_name = $('.option_wrap .selected').attr('data-value')
    var post_speaker_name_en = $('.option_wrap .selected').attr('data-value_en')
    if (sel_val.textContent=='ALL') {
      post_speaker_name = ''
      post_speaker_name_en = ''
    }
    var dataObj = {
      "speaker_name":post_speaker_name,
      "speaker_name_en":post_speaker_name_en,
      "content":content.value
    }
    var settings = {
      "async": true,
      "url": "/api/v1/sam/"+SAM_ID+"/create_session_talk",
      "method": "POST",
      "data":dataObj,
      "headers": {
          "accept": "application/json"
      }
    }
    $.ajax(settings).done(function (response) {
      document.querySelector('.h1-pop_title').innerHTML = ALERT_TXT_USE[7]
      MainModule.showPopHeightVertical();
      document.body.style.overflow = 'hidden';
      $('.btn-pop_submit').attr('onclick','history.go(-1)');
      // history.go(-1)
      // location.href='./ab.html?id='+MODULE_ID+'&m_id='+MEMBER_ID;
    })
  }

  function locationReplace(link){
    // console.log(link);
    location.replace(link);
  }


  return {
    init : init,
    locationReplace : locationReplace
  };
})();
(function () {
    QuestionModule.init();
})();
