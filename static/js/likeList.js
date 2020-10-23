var LikeListModule = (function(){
  var $root
  var favorite_id;
  var setting_time
  var LANG_TYPE;
  var MODULE_ID;
  var ALERT_TXT_EN = ['This session has already started or completed.','Please select time.','Not found the post.',['Sun','Mon','Tue','Wed','Thu','Fri','Sat']];
  var ALERT_TXT_KO = ['이미 시작되었거나 종료된 Session 입니다.','시간을 선택해주세요.','해당 게시글을 찾을 수 없습니다.',['일','월','화','수','목','금','토']];
  var ALERT_TXT_USE = [];
  var COLOR_CODE = ['x','메인색상','메인색상내부글자색상','RGB색상'];
  function init(){
    $root = $('.wrap');
    LANG_TYPE = MainModule.getSomeUrl('lang')
    LANG_TYPE = (LANG_TYPE != null && LANG_TYPE != undefined && LANG_TYPE != '') ? LANG_TYPE : localStorage.getItem('lang')
    LANG_TYPE = (LANG_TYPE=='') ? 'ko' : LANG_TYPE;
    //lang type 1순위 url parameter, 2순위 local storage
    MODULE_ID = MainModule.getSomeUrl('id')
    if (LANG_TYPE=='en') {
      ALERT_TXT_USE = ALERT_TXT_EN
    }else{
      ALERT_TXT_USE = ALERT_TXT_KO
    }
    localStorage.setItem('lang',LANG_TYPE);
    // COLOR_CODE = MainModule.getColorLocalStorage();
    // setColorStyle();
    getModuleData();
    eventBind();
  }

  function eventBind(){
    $root.on('click','.btn_alarm_wrap span',settingAlarm);
    $root.on('click','#submitAlarm',postAlarmSetting);
  }

  function getModuleData(){
    var settings = {
      "async": true,
      "url": "/api/v1/module/get_module_by_id/"+MODULE_ID,
      "method": "GET",
      "headers": {
          "accept": "application/json"
      }
    }
    $.ajax(settings).done(function (response) {
      var theTarget = response.module.properties
      COLOR_CODE[1] = theTarget.color_2;
      COLOR_CODE[2] = theTarget.color_3;
      var style_code = '.ab_title-h1{color:'+COLOR_CODE[1]+';}'
      style_code += '.ic_select{border-top-color:'+COLOR_CODE[1]+';}'
      style_code += '.btn-submit{background-color:'+COLOR_CODE[1]+'; color:'+COLOR_CODE[2]+';}'
      localStorage.setItem('color_code',JSON.stringify(COLOR_CODE));
      $('body').prepend('<style>'+style_code+'</style>');
      getMyFavoriteList()
    }).fail(function (response){
        if(response.status === 401){ // 로그인 안되어 있는 상태
          var MEMBER_ID = MainModule.getSomeUrl('m_id')
          var USER_ID = MainModule.getSomeUrl('user_id')
          var USER_EMAIL = MainModule.getSomeUrl('email')
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
            console.log(response)
            
            getModuleData()
          }).fail(function(response){
            alert('ERROR :: ',response.status);
          });
        }
    });
  }

  function getMyFavoriteList(){
    var dataObj = {
      "module_id":MODULE_ID
    }
    var settings = {
      "async": true,
      "url": "/api/v1/sam/get_my_favorite_list",
      "method": "GET",
      "data":dataObj,
      "headers": {
          "accept": "application/json"
      }
    }
    $.ajax(settings).done(function (response) {
      var listHtml = '';
      var week_name = ALERT_TXT_USE[3];
      for (var i = 0; i < response.length; i++) {
        var use_response_val = [response[i].topic,response[i].speaker_name,response[i].speaker_institute,response[i].authors]
        var lang_room = response[i].room
        if (LANG_TYPE == 'en') {//영어
          use_response_val = [response[i].topic_en,response[i].speaker_name_en,response[i].speaker_institute_en,response[i].authors_en]
          lang_room = response[i].room_en
        }
        listHtml += '<div class="ab_cnt"><table class="ab_table"><tr><td>'
        listHtml += '<div class="img-ratio_wrap"><div class="img-ratio_h"><div class="img-ratio_cen">'
        var this_photo = (response[i].speaker_photo_1!='') ? response[i].speaker_photo_1 : './static/images/img_human.png'
        listHtml += '<img src="'+this_photo+'" alt="">'//프로필사진
        listHtml += '</div></div></div></td>'
        listHtml += '<td class="ab_title"><a href="./ab_detail.html?id='+response[i].id+'"><h1 class="ab_title-h1">'+use_response_val[0]+'</h1></a></td>'//타이틀
        listHtml += '<td></td></tr>'
        var is_push = (response[i].push_type=='1') ? ' active' : ''
        listHtml += '<tr><td class="btn_alarm_wrap'+is_push+'" data-id="'+response[i].sam_favorite_id+'" data-date="'+response[i].date+'" data-start-time="'+response[i].time_start+'" data-end-time="'+response[i].time_end+'">'//액티브여부
        var time_txt = (response[i].minutes!=0 && response[i].minutes!=-1) ? response[i].minutes +'min' : ''
        listHtml += '<span class="btn_alarm"></span><span class="txt_alarm">'+time_txt+'</span>'//알람시간
        listHtml += '</td>'
        listHtml += '<td class="ab_info_wrap"><a href="./ab_detail.html?id='+response[i].id+'">'
        listHtml += '<h2 class="ab_name-h2">'+use_response_val[1]+'</h2>'
        listHtml += '<p class="ab_info">'+use_response_val[2]+''
        var is_authors = (use_response_val[3]=="") ? '' : '<br>('+use_response_val[3]+')'
        listHtml += is_authors
        // var is_room = (is_authors=="" && response[i].room=="") ? '' : (response[i].room=="") ? '<br>' : '<br>'+response[i].room

        var is_br = (is_authors=="") ? '<br>' : '<br>';
        var s_month = response[i].date.split('-')[1];
        s_month = (s_month.substr(0,1)==0) ? s_month.substr(1,2) : s_month
        var s_day = response[i].date.split('-')[2];
        s_day = (s_day.substr(0,1)==0) ? s_day.substr(1,2) : s_day;
        var s_date = s_month+'/'+s_day+'('+week_name[new Date(response[i].date).getDay()]+'), '
        listHtml += is_br+' <span class="ab_time">'+s_date+response[i].time_start+' ~ '+response[i].time_end+'</span> / '+lang_room+'</p></td></a>'

        // listHtml += is_room+' <span class="ab_time">('+response[i].time_start+' ~ '+response[i].time_end+' )</span></p></td></a>'
        listHtml += '</td><td></td></tr></table></div>'
      }
      document.querySelector('.wrap_w').innerHTML = listHtml;
    }).fail(function(response){

    });
  }

  function settingAlarm(){
    favorite_id = $(this).parent().attr('data-id')
    var date = $(this).parent().attr('data-date')
    var end_time = $(this).parent().attr('data-end-time')
    end_time = (end_time.split(':').shift().length==1) ? '0'+end_time : end_time;
    // new Date( ‘2016-10-24T13:00:00+09:00’ )
    setting_time = new Date(date+'T'+end_time+':00+09:00');
    var now_date = new Date();
    var alarm_el = document.querySelector('.alarm_pop_wrap')
    var alert_el = document.querySelector('.alert_pop_wrap')
    if (now_date>setting_time) {
      alarm_el.style.display = 'none';
      alert_el.style.display = 'block';
      alert_el.querySelector('.h1-pop_title').innerHTML = ALERT_TXT_USE[0]
      MainModule.showPopHeightVertical();
      document.body.style.overflow = 'hidden';
      // alert(ALERT_TXT_USE[0]);
      return false;
    }
    alarm_el.style.display = 'block';
    alert_el.style.display = 'none';
    MainModule.showPopHeightVertical();
  }

  function postAlarmSetting(){
    var minite = $('.select_trigger span');

    if(minite.attr('data-value')=='' || minite.attr('data-value')==undefined){
      alert(ALERT_TXT_USE[1])
      return false;
    }
    var dataObj = {
      "minutes":minite.attr('data-value')
    }
    var settings = {
      "async": true,
      "url": "/api/v1/sam/sam_favorite/"+favorite_id+"/set_alarm",
      "method": "POST",
      "data":dataObj,
      "headers": {
          "accept": "application/json"
      }
    }
    $.ajax(settings)
    .done(function (response) {
      document.querySelector('.select_trigger').innerHTML = '<span class="select_placeholder">SELECT</span><div class="ic_select"></div>'
      var el = document.querySelectorAll('.option_wrap span')
      for (var i = 0; i < el.length; i++) {
        el[i].classList.remove('selected');
      }
      getMyFavoriteList()
      MainModule.hidePop();

    }).fail(function(response){
      if (response.status==410) {
        alert('Validation error')
      }else if(response.status==411){
        alert(ALERT_TXT_USE[2])
      }
    });;
  }

  return {
    init : init
  };
})();
(function () {
    LikeListModule.init();
})();
