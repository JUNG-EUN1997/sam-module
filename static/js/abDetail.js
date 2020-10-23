var AbDetailModule = (function(){
  var $root
  var AB_ID;
  var LANG_TYPE;
  var COLOR_CODE = ['x','메인색상','메인색상내부글자색상','RGB색상'];
  var ALERT_TXT_KO = ['즐겨찾기에 추가되었습니다.','즐겨찾기에서 삭제되었습니다.']
  var ALERT_TXT_EN = ['Inserted to My schedule.','Removed from My schedule.']
  var ALERT_TXT_USE;
  function init(){
    $root = $('.wrap');
    AB_ID = MainModule.getSomeUrl('id');
    LANG_TYPE = MainModule.getLocalStorage()
    COLOR_CODE = MainModule.getColorLocalStorage();
    if (LANG_TYPE == 'en') {//영어
      ALERT_TXT_USE = ALERT_TXT_EN
      document.querySelector('.btn-submit').innerHTML = 'Submit'
    }else{//한국어
      ALERT_TXT_USE = ALERT_TXT_KO
    }
    setColorStyle();
    getDetailData();
    eventBind();
  }

  function eventBind(){
    $root.on('click','.like_wrap .btn_like',toggleFavorite)
  }

  function setColorStyle(){
    var style_code = '.detail_title{color:'+COLOR_CODE[1]+';}'
    style_code += '.btn-submit{background-color:'+COLOR_CODE[1]+';color:'+COLOR_CODE[2]+';}'

    $('body').prepend('<style>'+style_code+'</style>');
  }

  function getDetailData(){
    var settings = {
      "async": true,
      "url": "/api/v1/sam/"+AB_ID,
      "method": "GET",
      "headers": {
          "accept": "application/json"
      }
    }
    $.ajax(settings).done(function (response) {
      var week_name = ['일','월','화','수','목','금','토'];
      var use_response_val = [response.topic,response.speaker_name,response.speaker_institute,response.authors,response.abstract_detail,response.speaker_title]
      var lang_room = response.room
      if (LANG_TYPE=='en') {
        use_response_val = [response.topic_en,response.speaker_name_en,response.speaker_institute_en,response.authors_en,response.abstract_detail_en,response.speaker_title_en]
        week_name = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        document.querySelector('#abstractHref').innerHTML = '<button class="btn-submit mt-10">Show abstract</button>'
        lang_room = response.room_en
      }
      //날짜영역
      var s_month = response.date.split('-')[1];
      s_month = (s_month.substr(0,1)==0) ? s_month.substr(1,2) : s_month
      var s_day = response.date.split('-')[2];
      s_day = (s_day.substr(0,1)==0) ? s_day.substr(1,2) : s_day;
      var s_date = s_month+'/'+s_day+'('+week_name[new Date(response.date).getDay()]+'), '
      //날짜영역 끝

      var is_favorite = (response.is_favorite=="1") ? ' active' : ''
      var detail_html = '<div class="like_wrap"><span class="btn_like'+is_favorite+'"></span></div>'
      detail_html += '<h1 class="detail_title">'+use_response_val[0]+'</h1>'
      detail_html += '<table class="ab_table ab_table_detail"><tr><td><div class="img-ratio_wrap"><div class="img-ratio_h"><div class="img-ratio_cen">'
      var this_img = (response.speaker_photo_1=='') ? './static/images/img_human.png' : response.speaker_photo_1
      detail_html += '<img src="'+this_img+'" alt="">'
      detail_html += '</div></div></div></td>'
      detail_html += '<td class="ab_info_wrap">'
      detail_html += '<h2 class="ab_name-h2">'+use_response_val[1]+'<br>'+use_response_val[5]+'</h2>'
      detail_html += '<p class="ab_info">'+use_response_val[2]+''
      var is_authors = (use_response_val[3]=="") ? '' : '<br>('+use_response_val[3]+')'
      var is_br = (is_authors=="") ? '<br>' : '<br>';
      detail_html += is_authors
      var is_room = (is_authors=="" && lang_room=="") ? '' : (lang_room=="") ? '<br>' : '<br>'+lang_room
      detail_html += is_br+'<span class="ab_time">'+s_date+response.time_start+' ~ '+response.time_end+'</span>'+lang_room+'</p></td>'
      detail_html += '<td></td></tr></table>'
      detail_html += '<hr class="hr-division">'
      detail_html += '<div class="detail_content_wrap">'+use_response_val[4].replace(/(?:\r\n|\r|\n)/g, '<br>');+'</div>'
      document.querySelector('.detail_wrap').innerHTML = detail_html
      if (response.pdf_link!='') {
        $('#abstractHref').attr('href',response.pdf_link)
      }else{
        $('#abstractHref').remove();
      }
    }).fail(function(response){
      if (response.status==411) {
        alert('Sam not found')
      }
    })
  }

  function toggleFavorite(){
    var targetThis = this;
    var settings = {
      "async": true,
      "url": "/api/v1/sam/"+AB_ID+'/favorite_toggle',
      "method": "POST",
      "headers": {
          "accept": "application/json"
      }
    }
    $.ajax(settings).done(function (response) {
      if (targetThis.classList.contains('active')) {
        targetThis.classList.remove('active')
        document.querySelector('.h1-pop_title').innerHTML = ALERT_TXT_USE[1]
      }else {
        targetThis.classList.add('active')
        document.querySelector('.h1-pop_title').innerHTML = ALERT_TXT_USE[0]
      }
      MainModule.showPopHeightVertical();
      document.body.style.overflow = 'hidden';
    }).fail(function(response){
      if (response.status==411) {
        alert('Sam not found')
      }
    });
  }

  return {
    init : init
  };
})();
(function () {
    AbDetailModule.init();
})();
