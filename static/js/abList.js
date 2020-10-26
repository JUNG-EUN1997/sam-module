var AbListModule = (function(){
  var $root
  var menuOffset = [];
  var select_dates;
  var search_text ='';
  var is_first = true;
  var is_first_scroll_move = true;
  var MODULE_ID;
  var MEMBER_ID;
  var LANG_TYPE;
  var ALERT_TXT_KO = ['로그인 후 사용 가능합니다.',['일','월','화','수','목','금','토'],[0,1,2,3,4,5,6,7,8,9,10,11,12],'즐겨찾기에 추가되었습니다.','즐겨찾기에서 삭제되었습니다.']
  var ALERT_TXT_EN = ['You can use it after logging in.',['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],[0,'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],'Inserted to My schedule.','Removed from My schedule.']
  var ALERT_TXT_USE = []
  var IS_TOP_OPEN;
  var IS_BOT_OPEN;
  var SORT_TYPE;
  var COLOR_CODE = ['x','메인색상','메인색상내부글자색상','RGB색상'];
  var SCROLL_OBJ;
  function init(){
    $root = $('.wrap');
    MODULE_ID = MainModule.getSomeUrl('id')
    MEMBER_ID = MainModule.getSomeUrl('m_id')
    LANG_TYPE = MainModule.getLocalStorage()
    SORT_TYPE = localStorage.getItem('sort_type');
    SORT_TYPE = (SORT_TYPE==null) ? 0 : SORT_TYPE
    SCROLL_OBJ = localStorage.getItem('scroll_value')
    SCROLL_OBJ = (SCROLL_OBJ==null) ? {list_0:0,list_1:0,list_1_detail:0,speaker_list:0} : JSON.parse(SCROLL_OBJ);
    if (LANG_TYPE == 'en') {//영어
      ALERT_TXT_USE = ALERT_TXT_EN
      document.querySelector('.btn-submit').innerHTML = 'Submit'
    }else{//한국어
      ALERT_TXT_USE = ALERT_TXT_KO
    }

    getModuleData();
    eventBind();
  }

  function eventBind() {
    $root.on('change','input[name="dates"]',selectDate)
    $root.on('click','#searchText',searchText);
    $root.on('click','.session_m_title .session_title',locationProgramDetail)
    $root.on('click','.session_arrow',showAndHideList)
    $root.on('click','.btn_like',favoriteToggle)
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
      var use_response_val = [theTarget.tab_menu_name,theTarget.sam_category_menu_name,theTarget.sam_speaker_menu_name]
      if (LANG_TYPE == 'en') {
        use_response_val = [theTarget.tab_menu_name_en,theTarget.sam_category_menu_name_en,theTarget.sam_speaker_menu_name_en]
      }
      COLOR_CODE[1] = theTarget.color_2;
      COLOR_CODE[2] = theTarget.color_3;

      var bigint = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(COLOR_CODE[1]);
      var r = parseInt(bigint[1], 16);
      var g = parseInt(bigint[2], 16);
      var b = parseInt(bigint[3], 16);
      COLOR_CODE[3] = r + "," + g + "," + b;
      console.log(COLOR_CODE);
      var style_code = '.tab_wrap a.active, .tab_wrap a:hover{background-color:'+COLOR_CODE[1]+';color:'+COLOR_CODE[2]+'}'
      style_code += '.tab_wrap a.active>span,.tab_wrap a:hover>span{background-color:'+COLOR_CODE[1]+';color:'+COLOR_CODE[2]+';}'
      style_code += '.tab_wrap a.active>span:before, .tab_wrap a.active>span:after, .tab_wrap a:hover>span:before, .tab_wrap a:hover>span:after{background-color:'+COLOR_CODE[1]+';}';
      style_code += '.tab_wrap{border-color:'+COLOR_CODE[1]+'!important;}'
      style_code += '.session_l_title .session_title::before, .fixed-menu .session_title::before{background-color: '+COLOR_CODE[1]+';}'
      style_code += '.date_cnts input[type="radio"]:checked+.date_cnt{border-color: '+COLOR_CODE[1]+';}'
      style_code += '.date_cnts input[type="radio"]:checked+.date_cnt span{color:'+COLOR_CODE[1]+';}'
      style_code += '.session_m_title .session_title::before{background-color:rgba('+COLOR_CODE[3]+',0.4)}'
      style_code += '.ab_title-h1{color: '+COLOR_CODE[1]+'}'
      style_code += '.btn-submit{background-color:'+COLOR_CODE[1]+';color:'+COLOR_CODE[2]+';}'

      $('body').prepend('<style>'+style_code+'</style>');
      localStorage.setItem('color_code',JSON.stringify(COLOR_CODE));


      var is_active = (SORT_TYPE==0) ? 'active' : ''
      var tabHtml = '<a href="javascript:AbListModule.changeSortType(\'0\')" class="'+is_active+'"><span>'+use_response_val[0]+'</span></a>' //date별 탭이름
      is_active = (SORT_TYPE==1) ? 'active' : ''
      tabHtml += (String(theTarget.sam_category_menu)==='1') ? '<a href="javascript:AbListModule.changeSortType(\'1\')" class="'+is_active+'"><span>'+use_response_val[1]+'</span></a>' : '' //category별 탭이름
      tabHtml += (String(theTarget.sam_speaker_menu)==='1') ? '<a href="./speaker_list.html?id='+MODULE_ID+'&m_id='+MEMBER_ID+'"><span>'+use_response_val[2]+'</span></a>' : '<div></div>' ;
      tabHtml += (String(theTarget.sam_category_menu)!=='1') ? '<div></div>' : ''
      if (String(theTarget.sam_category_menu)==='0' && String(theTarget.sam_speaker_menu)==='0') {
        tabHtml = '';
        document.querySelector('.tab_wrap').style.border = 0;
      }
      document.querySelector('.tab_wrap').innerHTML = tabHtml;
      IS_TOP_OPEN = (Number(response.module.properties.session_top)==0) ? true : false;
      IS_BOT_OPEN = (Number(response.module.properties.session_bottom)==0) ? true : false;
      getLoggedForSam();
    });
  }

  function getLoggedForSam(){
    //로그인 되었을때만 노출되는거라 is_logged_for_sam api 기능 추가하기
    var dataObj = {
      "member_id":MEMBER_ID
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
      getSamList();
    }).fail(function(){
      alert(ALERT_TXT_USE[0])
    });

  }

  function getSamList(data_search,data_date){
    var dataObj = {
      "module_id":MODULE_ID,
      "search":data_search || '',
      "date":[data_date] || '',
      "lang":LANG_TYPE,
      "sort_type": SORT_TYPE
    }
    $(window).scrollTop(0);
    if (data_search=='' || data_search==undefined) {
      document.querySelector('#searchInput').value = '';
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
        var week_name = ALERT_TXT_USE[1];

        if (is_first) {
          is_first= false;
          if (SORT_TYPE==0) {
            var is_scroll = false;
            var today = new Date();
            var year = today.getFullYear();
            var month = String(today.getMonth()+1);
            month = (month.length==1) ? '0'+month : month;
            var day = String(today.getDate());
            day = (day.length==1) ? '0'+day : day;
            var date_val = year+'-'+month+'-'+day
            var date_html = '';
            var select_dates = getLocalStorage();
            console.log('select_dates>>',select_dates);
            // var is_checked = true;
            today.setHours(0,0,0,0);
            var check_date = {second : '',date:''};
            if (select_dates!='') {
              check_date.date = select_dates
            }
            $.each(response.sam_dates,function(key,value){
              var date_month = value.split('-')[1]
              date_month = (date_month.substring(0,1)=='0') ? date_month.substring(1,2) : date_month
              var date_day = value.split('-')[2]
              date_day = (date_day.substring(0,1)=='0') ? date_day.substring(1,2) : date_day
              var date_week = week_name[new Date(value).getDay()];
              var is_active = ''
              var is_tabIndex = ''
              date_html += '<input type="radio" id="date'+key+'" name="dates" value="'+value+'" '
              date_html += '>'
              var this_date = new Date(value)
              this_date.setHours(0,0,0,0)
              var day_subtract = today - this_date;
              if (select_dates=='') {
                console.log('첫접속');
                if ((check_date.second=='' || check_date.second>=Math.abs(day_subtract) || day_subtract===0)&&check_date.second!==0) {
                  check_date.second = day_subtract;
                  check_date.date = value;
                  console.log(check_date);
                }
              }
              var month_en = ['x','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
              var is_date = (LANG_TYPE == 'en') ?
              month_en[date_month]+', '+date_day + '<br>('+date_week+')' :
              date_month+'월 '+date_day+'일('+date_week+')'
              date_html += '<label for="date'+key+'" class="date_cnt'+is_active+'" '+is_tabIndex+'><span>'+is_date+'</span></label>'
            })
            document.querySelector('.date_cnts').innerHTML = date_html;
            select_dates = check_date.date
            console.log(check_date,'select_dates>>',select_dates);
            setTimeout(function(){
              console.log('select_dates>>',select_dates);
              $('input[value="'+check_date.date+'"]').attr('checked',true);
              $('input[value="'+check_date.date+'"]').next('label').attr('tabindex','0')
              $('input[value="'+check_date.date+'"]').next('label').focus();
            },300)
            setTimeout(function(){
              console.log('select_dates!!>>',select_dates);
            },5000)
            setLocalStorage(select_dates);
            getSamList('',select_dates);

          }else if (SORT_TYPE==1) {
            var date_el = document.querySelector('.date_wrap');
            if (date_el) {
              date_el.parentNode.removeChild(date_el);
            }
            var only_lmenu_html = '';
            $.each(response.sam_categories,function(key,value){
              var url_name = escape(value)
              only_lmenu_html += '<div class="session_cnt_wrap"><a href="javascript:AbListModule.scrollPush(\'./ab_category.html?id='+MODULE_ID+'&m_id='+MEMBER_ID+'&name='+url_name+'\')">'
              only_lmenu_html += '<div class="session_l_title">'
              only_lmenu_html += '<div class="session_title session_only_title"><span>'+value+'</span></div>'
              only_lmenu_html += '<div class="session_arrow right_arrow"></div></div></a></div>'
            });
            document.querySelector('.ab_list_wrap').innerHTML = only_lmenu_html;
            document.body.style.overflow="";
            $(window).scrollTop(SCROLL_OBJ['list_'+SORT_TYPE])
          }
          var top_fix_h = $('.top-fixed-menu').height() + 20;
          document.querySelector('.scroll_wrap').style.paddingTop = top_fix_h +'px'
          return false;
        }
          var ab_list_html = '<div class="fixed-menu"></div>'

          var is_l_show = (IS_TOP_OPEN) ? '' : ' hide';
          var is_m_show = (IS_BOT_OPEN) ? '' : ' hide';
          $.each(response.sam_list,function(key,value){
            //대메뉴
            var is_session_talk = (value.session_talk==1 || SORT_TYPE==1 ) ? '' : '<div class="sesstion_btn"><a href="./question.html?id='+MODULE_ID+'&s_id='+value.id+'&m_id='+MEMBER_ID+'"><span></span></a></div>'
            ab_list_html += '<div class="session_cnt_wrap"><div class="session_l_title'+is_l_show+'"><div class="session_title">'
            var lang_room = value.room
            if (LANG_TYPE == 'en') {
              ab_list_html += '<span>'+value.session_name_en+'</span>' // session_name_en
              lang_room = value.room_en
            }else{
              ab_list_html += '<span>'+value.session_name+'</span>' // session_name
            }
            var l_month = value.date.split('-')[1];
            l_month = (l_month.substr(0,1)==0) ? l_month.substr(1,2) : l_month
            var l_day = value.date.split('-')[2];
            l_day = (l_day.substr(0,1)==0) ? l_day.substr(1,2) : l_day;
            var l_room = (lang_room=='') ? '' : ' / '+lang_room
            ab_list_html += '<span>'+l_month+'/'+l_day+'('+week_name[new Date(value.date).getDay()]+'), '+value.time_start+' ~ '+value.time_end+l_room+'</span>'//날짜 및 장소
            var is_right_arrow = (SORT_TYPE==1) ? ' right_arrow' : ''
            var arrow_html = (value.child_sams.length>0) ? '<div class="session_arrow'+is_right_arrow+'"></div>' : '';
            ab_list_html += '</div>'+is_session_talk+arrow_html+'</div>'
              ab_list_html += '<div class="content_m_wrap">'
            $.each(value.child_sams,function(ch_key,ch_val){
              //소메뉴
                var is_session_talk_m = (ch_val.session_talk==1) ? '' : '<div class="sesstion_btn"><a href="./question.html?id='+MODULE_ID+'&s_id='+ch_val.id+'&m_id='+MEMBER_ID+'"><span></span></a></div>'
                ab_list_html += '<div class="session_m_title'+is_m_show+'" data-id="'+ch_val.id+'"><div class="session_title">'
                var is_speaker_institute = (ch_val.speaker_institute=="") ? '' : '/'+ch_val.speaker_institute
                var lang_speaker_name = ch_val.speaker_name
                var m_lang_room = ch_val.room
                if (LANG_TYPE == 'en') {
                  lang_speaker_name = ch_val.speaker_name_en
                  is_speaker_institute = (ch_val.speaker_institute_en=="") ? '' : '/'+ch_val.speaker_institute_en
                  ab_list_html += '<span>'+ch_val.session_name_en+'</span>'
                  m_lang_room = ch_val.room_en
                }else{
                  ab_list_html += '<span>'+ch_val.session_name+'</span>'
                }
                ab_list_html += '<span>'+lang_speaker_name+is_speaker_institute+'</span>'
                var m_month = ch_val.date.split('-')[1];
                m_month = (m_month.substr(0,1)==0) ? m_month.substr(1,2) : m_month
                var m_day = ch_val.date.split('-')[2];
                m_day = (m_day.substr(0,1)==0) ? m_day.substr(1,2) : m_day;
                var m_date = m_month+'/'+m_day+'('+week_name[new Date(ch_val.date).getDay()]+'), '
                var is_time;
                var is_start_time = ch_val.time_start
                var is_end_time = ch_val.time_end
                if(is_start_time!='' && is_end_time !=''){
                  is_time = ch_val.time_start+' ~ '+ch_val.time_end
                }else if (is_start_time!='' || is_end_time !='') {
                  is_time = is_start_time+is_end_time
                }else{
                  is_time = ''
                }
                var m_room = (m_lang_room=='') ? '' : ' / '+m_lang_room
                ab_list_html += '<span>'+m_date+is_time+m_room+'</span>'
                var arrow_html = (ch_val.child_sams.length>0) ? '<div class="session_arrow"></div>' : '';
                ab_list_html += '</div>'+is_session_talk_m+arrow_html+'</div>'

              ab_list_html += '<div class="session_content_wrap"><div class="sesstion_content">'
              $.each(ch_val.child_sams,function(con_key,con_val){
                ab_list_html += '<div class="ab_cnt"><table class="ab_table"><tr><td><div class="img-ratio_wrap"><div class="img-ratio_h"><div class="img-ratio_cen">'
                var this_img = (con_val.speaker_photo_1=='') ? './static/images/img_human.png' : con_val.speaker_photo_1
                ab_list_html += '<img src="'+this_img+'" alt="">'
                ab_list_html += '</div></div></div></td>'
                var lang_topic = con_val.topic
                var lang_speaker_name_conval = con_val.speaker_name
                var lang_speaker_title = con_val.speaker_title
                var lang_speaker_institute = con_val.speaker_institute
                var lang_authors = con_val.authors
                var lang_con_room = con_val.room
                if (LANG_TYPE == 'en') {
                  lang_topic = con_val.topic_en
                  lang_speaker_name_conval = con_val.speaker_name_en
                  lang_speaker_title = con_val.speaker_title_en
                  lang_speaker_institute = con_val.speaker_institute_en
                  lang_authors = con_val.authors_en
                  lang_con_room = con_val.room_en
                }
                lang_topic = (lang_topic != '') ? '<br>' + lang_topic : lang_topic
                var is_favorite = (con_val.is_favorite == "1") ? ' active' : '';
                ab_list_html += '<td class="ab_title"><a href="javascript:AbListModule.scrollPush(\'ab_detail.html?id='+con_val.id+'\')"><h1 class="ab_title-h1">'+lang_speaker_name_conval+'</h1></a></td></tr>'
                ab_list_html += '<tr><td class="ab_like" data-id="'+con_val.id+'"><span class="btn_like'+is_favorite+'"></span></td><td class="ab_info_wrap"><a href="javascript:AbListModule.scrollPush(\'ab_detail.html?id='+con_val.id+'\')">'
                ab_list_html += '<h2 class="ab_name-h2">'+lang_speaker_title+'<span class="ab_subname">'+lang_topic+'</span></h2>'
                ab_list_html += '<p class="ab_info">'+lang_speaker_institute+''
                var is_authors = (lang_authors=="") ? '' : '<br>('+lang_authors+')'
                ab_list_html += is_authors
                // var is_room = (is_authors=="" && con_val.room=="") ? '' : (con_val.room=="") ? '<br>' : '<br>'+con_val.room
                var is_br = (is_authors=="") ? '<br>' : '<br>';
                var s_month = con_val.date.split('-')[1];
                s_month = (s_month.substr(0,1)==0) ? s_month.substr(1,2) : s_month
                var s_day = con_val.date.split('-')[2];
                s_day = (s_day.substr(0,1)==0) ? s_day.substr(1,2) : s_day;
                var s_date = s_month+'/'+s_day+'('+week_name[new Date(con_val.date).getDay()]+'), '
                ab_list_html += is_br+' <span class="ab_time">'+s_date+con_val.time_start+' ~ '+con_val.time_end+'</span> / '+lang_con_room+'</p></a></td>'
                ab_list_html += '</tr></table></div>'
              })
              ab_list_html += '</div></div>'
            });
            ab_list_html += '</div>'
            ab_list_html += (SORT_TYPE==1) ? '</a>' : '';
            ab_list_html += '</div>'

            if (value.child_sams.length==0 && SORT_TYPE==0) {
              ab_list_html += '</div></div>'
            }
          })
          if (response.sam_list.length<1) {
            ab_list_html += '<div class="no-result-bg"></div>'
          }
          document.querySelector('.ab_list_wrap').innerHTML = ab_list_html;
          document.body.style.overflow="";
          var top_fix_h = $('.top-fixed-menu').height() + 20;
          if (is_first_scroll_move) {
            is_first_scroll_move = false;
            $(window).scrollTop(SCROLL_OBJ['list_'+SORT_TYPE])

          }

          document.querySelector('.fixed-menu').style.marginTop = top_fix_h +'px'
          getMenuOffset();

    });
  }

  function showAndHideList(){
    var theTarget = $(this).parent('div');
    if (theTarget.hasClass('hide')) {
      theTarget.removeClass('hide');
    }else{
      theTarget.addClass('hide');
    }
  }

  function locationProgramDetail(){
    var this_id = $(this).closest('.session_m_title').attr('data-id');
    console.log('test',this_id)
    scrollPush('ab_detail.html?id='+this_id);
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
        document.querySelector('.h1-pop_title').innerHTML = ALERT_TXT_USE[4]
      }else{
        $this.addClass('active')
        document.querySelector('.h1-pop_title').innerHTML = ALERT_TXT_USE[3]
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

  function getMenuOffset(){
    var target = $('.session_cnt_wrap');
    menuOffset = [];
    target.each(function(key,value){
      var eachTarget = $(this).offset().top
      var push_val = {'start':(eachTarget),'end':eachTarget+($(this).height()-20)}
      menuOffset.push(push_val);
    })
    $(document).on('scroll',$.throttle( 250, floatingSessionMenu ));
  }

  function floatingSessionMenu(){
    var scroll_val = $(document).scrollTop()

    if(menuOffset.length==0){
      return false;
    }else if (menuOffset[0].start>scroll_val) {
      document.querySelector('.fixed-menu').innerHTML = ''
      document.querySelector('.fixed-menu').style.borderBottom='none'
    }else{
      for (var i = 0; i < menuOffset.length; i++) {
        var theTarget = document.querySelectorAll('.session_cnt_wrap')[i]
        if (theTarget!='' && theTarget!=undefined) {
          var menuTarget = theTarget.querySelector('.session_l_title')
          if (menuTarget!='' && menuTarget!=undefined) {
            if (menuOffset[i].start<scroll_val && menuOffset[i].end>scroll_val) {//해당 메뉴가 보여야할 때;
              document.querySelector('.fixed-menu').innerHTML = menuTarget.innerHTML;
              document.querySelector('.fixed-menu').style.borderBottom='1px solid #aaa'
            }
          }
        }
      }
    }
  }

  function getLocalStorage(){
    var history_date = localStorage.getItem('date');
    if (history_date == null) {
      return false
    }else{
      if (typeof history_date == 'object'){
        return JSON.parse(history_date);
      }else{
        return history_date;
      }
    }
  }

  function setLocalStorage(date){
    console.log('local date >> ',date)
    console.log(typeof date == 'object')
    var push_date = (typeof date == 'object') ? JSON.stringify(date_arr) : date;
    console.log('push_date>> ',push_date)
    localStorage.setItem('date',push_date);
  }

  function searchText(){
    console.log('search! >> select_dates ',select_dates)
    // setTimeout(function(){
      search_text = document.querySelector('#searchInput').value;
      console.log(search_text,'select_dates>>',select_dates)
      var date_check_el = document.querySelector('input[name="dates"]:checked')
      if(select_dates == undefined && date_check_el != null){
        select_dates = date_check_el.value
      }
      // if(search_text == ''){
        
      // }
      if (SORT_TYPE==1) {
        is_first=true;
      }
    getSamList(search_text,select_dates)
    // },1000)
  }

  function selectDate(){
    if (this.checked) {
      select_dates = this.value
    }
    console.log('select_dates>>',select_dates);
    setLocalStorage(select_dates);
    getSamList(search_text,select_dates)
  }

  function changeSortType(value){
    localStorage.setItem('sort_type',value);
    location.href = './ab.html?id='+MODULE_ID+'&m_id='+MEMBER_ID
  }

  function scrollPush(location_url){
    SCROLL_OBJ['list_'+SORT_TYPE] = window.scrollY
    SCROLL_OBJ['list_1_detail'] = 0;
    localStorage.setItem('scroll_value',JSON.stringify(SCROLL_OBJ))
    location.href = location_url
  }

  return {
    init : init,
    changeSortType : changeSortType,
    scrollPush:scrollPush
  };
})();
(function () {
    AbListModule.init();
})();
