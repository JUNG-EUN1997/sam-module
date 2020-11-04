var SpeakerDetailModule = (function(){
  var $root
  var SPEAKER_NAME
  var SPEAKER_INSTITUTE;
  var SPEAKER_TITLE;
  var LANG_TYPE;
  var MODULE_ID;
  var ALERT_TXT_KO = ['로그인 후 사용 가능합니다.',['일','월','화','수','목','금','토']]
  var ALERT_TXT_EN = ['You can use it after logging in.',['Sun','Mon','Tue','Wed','Thu','Fri','Sat']]
  var ALERT_TXT_USE = []
  var COLOR_CODE = ['x','메인색상','메인색상내부글자색상','RGB색상'];
  function init(){
    $root = $('.wrap');
    MODULE_ID = MainModule.getSomeUrl('id')
    SPEAKER_NAME = unescape(MainModule.getSomeUrl('name'))
    SPEAKER_INSTITUTE = unescape(MainModule.getSomeUrl('institute'))
    SPEAKER_TITLE = unescape(MainModule.getSomeUrl('title'))
    LANG_TYPE = MainModule.getLocalStorage()
    COLOR_CODE = MainModule.getColorLocalStorage();
    if (LANG_TYPE == 'en') {//영어
      ALERT_TXT_USE = ALERT_TXT_EN
    }else{//한국어
      ALERT_TXT_USE = ALERT_TXT_KO
    }
    setColorStyle();
    getThisSpeaker();
    getThisSpeakerSam()
  }

  function setColorStyle(){
    var style_code = '.ab_title-h1{color:'+COLOR_CODE[1]+';}'
    $('body').prepend('<style>'+style_code+'</style>');
  }

  function getThisSpeaker(){
    var dataObj = {
      'search' : SPEAKER_NAME,
      "module_id":MODULE_ID
    }
    var settings = {
      "async": true,
      "url": "/api/v1/sam/get_all_speaker_list",
      "method": "GET",
      "data":dataObj,
      "headers": {
          "accept": "application/json"
      }
    }
    $.ajax(settings).done(function (response) {
      var listHtml = ''
      for (var i = 0; i < response.length; i++) {
        if (response[i].speaker_name == SPEAKER_NAME && response[i].speaker_title == SPEAKER_TITLE) {
          var use_response_val = [response[i].speaker_name,response[i].speaker_institute];
          if (LANG_TYPE=='en') {
            use_response_val = [response[i].speaker_name_en,response[i].speaker_institute_en];
          }
          listHtml += '<table class="ab_table"><tbody><tr><td><div class="img-ratio_wrap"><div class="img-ratio_h"><div class="img-ratio_cen">'
          var this_photo = (response[i].speaker_photo_1!='') ? response[i].speaker_photo_1 : './static/images/img_human.png'
          listHtml += '<img src="'+this_photo+'" alt="">'
          listHtml += '</div></div></div></td>'
          listHtml += '<td class="ab_title">'
          listHtml += '<h1 class="ab_title-h1">'+use_response_val[0]+'</h1>'
          listHtml += '<p class="ab_info">'+use_response_val[1]+'</p>'
          listHtml += '</td><td></td></tr></tbody></table>'
          document.querySelector('.ab_cnt').innerHTML = listHtml;
          break;
        }
      }
    });
  }

  function getThisSpeakerSam(){
    var dataObj = {
      "speaker_name":SPEAKER_NAME,
      "speaker_title":SPEAKER_TITLE,
      "module_id":MODULE_ID
    }
    var settings = {
      "async": true,
      "url": "/api/v1/sam/get_sam_list_by_speaker",
      "method": "GET",
      "data":dataObj,
      "headers": {
          "accept": "application/json"
      }
    }
    $.ajax(settings).done(function (response) {
      var samHtml = '';
      var week_name = ALERT_TXT_USE[1];
      for (var i = 0; i < response.length; i++) {
        var use_response_val = [response[i].topic,response[i].speaker_name,response[i].speaker_institute,response[i].authors]
        var lang_room = response[i].room
        if (LANG_TYPE=='en') {
          use_response_val = [response[i].topic_en,response[i].speaker_name_en,response[i].speaker_institute_en,response[i].authors_en]
          lang_room = response[i].room_en
        }
        var is_pdf = (response[i].pdf_link!='') ? '<div class="ic-file"></div>' : ''
        samHtml += '<div class="ab_cnt"><a href="./ab_detail.html?id='+response[i].id+'">'+is_pdf;
        samHtml += '<h1 class="ab_title-h1">'+use_response_val[0]+'</h1>'
        samHtml += '<h2 class="ab_name-h2">'+use_response_val[1]+'</h2>'
        var is_speaker_institute = (use_response_val[2]!='') ? use_response_val[2] + '<br>' : ''
        samHtml += '<p class="ab_info">'+is_speaker_institute+'<br>'
        var is_authors = (use_response_val[3]!='') ? '('+use_response_val[3]+')<br>' : ''
        samHtml += is_authors


        var s_month = response[i].date.split('-')[1];
        s_month = (s_month.substr(0,1)==0) ? s_month.substr(1,2) : s_month
        var s_day = response[i].date.split('-')[2];
        s_day = (s_day.substr(0,1)==0) ? s_day.substr(1,2) : s_day;
        var s_date = s_month+'/'+s_day+'('+week_name[new Date(response[i].date).getDay()]+'), '

        var is_time;
        var is_start_time = response[i].time_start
        var is_end_time = response[i].time_end
        if(is_start_time!='' && is_end_time !=''){
          is_time = ' ('+response[i].time_start+' ~ '+response[i].time_end+')'
        }else if (is_start_time!='' || is_end_time !='') {
          is_time = ' ('+is_start_time+is_end_time+')'
        }else{
          is_time = ''
        }

        samHtml += '<span>'+s_date+response[i].time_start+' ~ '+response[i].time_end+'</span> / '+lang_room+'</span></p></a></div>'
      }
      document.querySelector('.speaker_ab_wrap').innerHTML = samHtml
    });
  }

  return {
    init : init
  };
})();
(function () {
    SpeakerDetailModule.init();
})();
