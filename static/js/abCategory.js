var AbCategoryModule = (function(){
  var $root
  var MODULE_ID;
  var MEMBER_ID;
  var LANG_TYPE;
  var SORT_TYPE = 1;//이 페이지는 category 별로 볼 때만 노출됨
  var PAGE_NAME;
  var ALERT_TXT_KO = ['로그인 후 사용 가능합니다.',['일','월','화','수','목','금','토'],'즐겨찾기에 추가되었습니다.','즐겨찾기에서 삭제되었습니다.']
  var ALERT_TXT_EN = ['You can use it after logging in.',['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],'Inserted to My schedule.','Removed from My schedule.']
  var ALERT_TXT_USE = []
  var COLOR_CODE = ['x','메인색상','메인색상내부글자색상','RGB색상'];
  var SCROLL_OBJ;
  function init(){
    $root = $('.wrap');
    MODULE_ID = MainModule.getSomeUrl('id')
    MEMBER_ID = MainModule.getSomeUrl('m_id')
    LANG_TYPE = MainModule.getLocalStorage()
    PAGE_NAME = unescape(MainModule.getSomeUrl('name'))
    // SORT_TYPE = localStorage.getItem('sort_type');
    // SORT_TYPE = (SORT_TYPE==null) ? 0 : SORT_TYPE
    SCROLL_OBJ = localStorage.getItem('scroll_value')
    SCROLL_OBJ = (SCROLL_OBJ==null) ? {list_0:0,list_1:0,list_1_detail:0,speaker_list:0} : JSON.parse(SCROLL_OBJ);
    if (LANG_TYPE == 'en') {//영어
      ALERT_TXT_USE = ALERT_TXT_EN
      document.querySelector('.btn-submit').innerHTML = 'Submit'
    }else{//한국어
      ALERT_TXT_USE = ALERT_TXT_KO
    }
    COLOR_CODE = MainModule.getColorLocalStorage();
    setColorStyle();
    getSamList();
    eventBind();
  }

  function eventBind(){
    $root.on('click','.btn_like',favoriteToggle)
  }

  function setColorStyle(){
    var style_code = '.cat_title h1{ color:'+COLOR_CODE[2]+';}'
    style_code += '.cat_title{background-color:'+COLOR_CODE[1]+';}'
    style_code += '.session_m_title .session_title::before{background-color:rgba('+COLOR_CODE[3]+',0.4)}'
    style_code += '.ab_title-h1{color: '+COLOR_CODE[1]+'}'
    style_code += '.btn-submit{background-color:'+COLOR_CODE[1]+';color:'+COLOR_CODE[2]+';}'

    $('body').prepend('<style>'+style_code+'</style>');
  }

  function getSamList(){
    var dataObj = {
      "module_id":MODULE_ID,
      "lang":LANG_TYPE,
      "sort_type": SORT_TYPE
    }
    var settings = {
      "async": true,
      "url": "/api/v1/sam/get_sam_list",
      "method": "GET",
      "data": dataObj,
      "headers": {
          "accept": "application/json"
      }
    }
    $.ajax(settings).done(function (response) {
      console.log(response);
      for (var i = 0; i < response.sam_categories.length; i++) {
        var target = response.sam_categories[i]
        if (PAGE_NAME == target) {
          document.querySelector('.cat_title h1').innerHTML = target;
          break;
        }
      }//title 바꾸는 영역 끝
      var list_html = '';
      $.each(response.sam_list,function(l_key,l_val){
        if (PAGE_NAME == l_val.session_name) {
          var week_name = ALERT_TXT_USE[1];
          $.each(l_val.child_sams,function(m_key,m_val){
            console.log(m_val);
            var is_speaker_institute = (m_val.speaker_institute=="") ? '' : '/'+m_val.speaker_institute
            var lang_speaker_name = m_val.speaker_name
            if (LANG_TYPE == 'en') {
              lang_speaker_name = m_val.speaker_name_en
              is_speaker_institute = (m_val.speaker_institute_en=="") ? '' : '/'+m_val.speaker_institute_en
            }

            //시간영역
            var m_month = m_val.date.split('-')[1];
            m_month = (m_month.substr(0,1)==0) ? m_month.substr(1,2) : m_month
            var m_day = m_val.date.split('-')[2];
            m_day = (m_day.substr(0,1)==0) ? m_day.substr(1,2) : m_day;
            var m_date = m_month+'/'+m_day+'('+week_name[new Date(m_val.date).getDay()]+'), '
            var is_time;
            var is_start_time = m_val.time_start
            var is_end_time = m_val.time_end
            if(is_start_time!='' && is_end_time !=''){
              is_time = m_val.time_start+' ~ '+m_val.time_end
            }else if (is_start_time!='' || is_end_time !='') {
              is_time = is_start_time+is_end_time
            }else{
              is_time = ''
            }
            var m_room = (m_val.room=='') ? '' : ' / '+m_val.room
            //시간영역 종료
            //세션톡 on/off 영역
            var is_session_talk_m = (m_val.session_talk==1) ? '' : '<div class="sesstion_btn"><a href="./question.html?id='+MODULE_ID+'&s_id='+m_val.id+'&m_id='+MEMBER_ID+'"><span></span></a></div>'
            //html파일에 넣는 영역
            list_html += '<div class="session_m_title">'
              list_html += '<div class="session_title">'
                list_html += '<span>'+m_val.session_name+'</span>'
                list_html += '<span>'+lang_speaker_name+is_speaker_institute+'</span>'
                list_html += '<span>'+m_date+is_time+m_room+'</span>'
              list_html += '</div>'
              list_html += is_session_talk_m
            list_html += '</div>';
            var s_list_html = '';//내용영역만 담는 변수
            $.each(m_val.child_sams,function(s_key,s_val){//내용영역 each 시작
              var this_img = (s_val.speaker_photo_1=='') ? './static/images/img_human.png' : s_val.speaker_photo_1
              var lang_topic = s_val.topic
              var lang_speaker_name_conval = s_val.speaker_name
              var lang_speaker_title = s_val.speaker_title
              var lang_speaker_institute = s_val.speaker_institute
              var lang_authors = s_val.authors
              if (LANG_TYPE == 'en') {
                lang_topic = s_val.topic_en
                lang_speaker_name_conval = s_val.speaker_name_en
                lang_speaker_title = s_val.speaker_title_en
                lang_speaker_institute = s_val.speaker_institute_en
                lang_authors = s_val.authors_en
              }
              var is_favorite = (s_val.is_favorite == "1") ? ' active' : '';
              var is_authors = (lang_authors=="") ? '' : '<br>('+lang_authors+')'
              var is_br = (is_authors=="") ? '<br>' : '<br>';
              //날짜영역
              var s_month = s_val.date.split('-')[1];
              s_month = (s_month.substr(0,1)==0) ? s_month.substr(1,2) : s_month
              var s_day = s_val.date.split('-')[2];
              s_day = (s_day.substr(0,1)==0) ? s_day.substr(1,2) : s_day;
              var s_date = s_month+'/'+s_day+'('+week_name[new Date(s_val.date).getDay()]+'), '
              //날짜영역 끝
              s_list_html += '<div class="ab_cnt">'
              s_list_html += '<table class="ab_table"><tbody>'
              s_list_html += '<tr>'
                s_list_html += '<td>'
                s_list_html += '<div class="img-ratio_wrap"><div class="img-ratio_h"><div class="img-ratio_cen"><img src="'+this_img+'" alt=""></div></div></div>'
                s_list_html += '</td>'
                s_list_html += '<td class="ab_title">'
                s_list_html += '<a href="javascript:AbCategoryModule.scrollPush(\'ab_detail.html?id='+s_val.id+'\')"><h1 class="ab_title-h1">'+lang_topic+'</h1></a>'
                s_list_html += '</td>'
                s_list_html += '<td></td>'
              s_list_html += '</tr>'
              s_list_html += '<tr>'
                s_list_html += '<td class="ab_like" data-id="'+s_val.id+'"><span class="btn_like'+is_favorite+'"></span></td>'
                s_list_html += '<td class="ab_info_wrap">'
                s_list_html += '<a href="javascript:AbCategoryModule.scrollPush(\'ab_detail.html?id='+s_val.id+'\')">'
                s_list_html += '<h2 class="ab_name-h2">'+lang_speaker_name_conval+' '+lang_speaker_title+'</h2>'
                s_list_html += '<p class="ab_info">'+lang_speaker_institute+is_authors+is_br
                s_list_html += '<span class="ab_time">'+s_date+s_val.time_start+' ~ '+s_val.time_end+'</span> / '+s_val.room+'</p></a></td>'
                s_list_html += '<td></td>'
              s_list_html += '</tr>'
              s_list_html += '</tbody></table></div>'
            })//내용영역 each 종료
            s_list_html = (s_list_html=='') ? '' : '<div class="session_content_wrap"><div class="sesstion_content">'+s_list_html+'</div></div>'
            list_html += s_list_html
          })//중간메뉴 each 종료
        }//대메뉴 세션명이 페이지 이름과 같은 영역 종료
      })//대메뉴 each 종료
      if (list_html=='') {
        list_html = '<div class="no-result-bg"></div>'
      }
      document.querySelector('.cat_contents').innerHTML = list_html
      var wrap_el = document.querySelector('.animation_wrap');

      wrap_el.classList.add('left');
      setTimeout(function(){
        // document.querySelector('body').style.height = 'auto'
        // document.querySelector('body').style.overflow = 'auto'
        $(window).scrollTop(SCROLL_OBJ['list_1_detail'])
      },300)
    });
  }

  function favoriteToggle(){
    var $this = $(this)
    var theTarget = $this.parent()
    var this_id = theTarget.attr('data-id');
    var settings = {
        "async": true,
        "url": "/api/v1/sam/"+this_id+"/favorite_toggle",
        "method": "POST",
        "headers": {
            "accept": "application/json"
        }
    }

    $.ajax(settings).done(function (response) {
      if ($this.hasClass('active')) {
        $this.removeClass('active')
        document.querySelector('.h1-pop_title').innerHTML = ALERT_TXT_USE[3]
      }else{
        $this.addClass('active')
        document.querySelector('.h1-pop_title').innerHTML = ALERT_TXT_USE[2]
      }
      MainModule.showPopHeightVertical();
      document.body.style.overflow = 'hidden';
    }).fail(function(response){
      if (response.status===411) {
        alert('해당 모듈을 찾을 수 없습니다.')
      }else{
        alert('ERROR CODE::'+response.status)
      }
    });
  }
  function scrollPush(location_url){
    SCROLL_OBJ['list_1_detail'] = window.scrollY
    localStorage.setItem('scroll_value',JSON.stringify(SCROLL_OBJ))
    location.href = location_url
  }

  return {
    init : init,
    scrollPush:scrollPush
  };
})();
(function () {
    AbCategoryModule.init();
})();
