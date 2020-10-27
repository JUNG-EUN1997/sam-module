var SpeakerListModule = (function(){
  var $root
  var letter_search ='' //input radio select value
  var search = ''; //input text
  var sort_type = null;
  var MODULE_ID;
  var LANG_TYPE;
  var MEMBER_ID;
  var COLOR_CODE = ['x','메인색상','메인색상내부글자색상','RGB색상'];
  var SCROLL_OBJ;
  function init(){
    $root = $('.wrap');
    MODULE_ID = MainModule.getSomeUrl('id')
    LANG_TYPE = MainModule.getLocalStorage()
    MEMBER_ID = MainModule.getSomeUrl('m_id')
    SCROLL_OBJ = localStorage.getItem('scroll_value')
    SCROLL_OBJ = (SCROLL_OBJ==null) ? {list_0:0,list_1:0,list_1_detail:0,speaker_list:0} : JSON.parse(SCROLL_OBJ);
    sort_type = LANG_TYPE
    getModuleData()
    eventBind();
  }
  function eventBind(){
    $root.on('click','.ab_cnt',getThisSpeakerSam);
    $root.on('change','input[name="term"]',selectTerm);
    $root.on('click','#searchBtn',searchText);
    $root.on('click','#searchPopBtn',showPop)
    $root.on('change','#selTerm',changeListSort);
  }

  function vh(v) {
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    return (v * h) / 100;
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
      var tabHtml = '<a href="javascript:SpeakerListModule.changeSortType(\'0\')"><span>'+use_response_val[0]+'</span></a>' //date별 탭이름
      tabHtml += (String(theTarget.sam_category_menu)==='1') ? '<a href="javascript:SpeakerListModule.changeSortType(\'1\')"><span>'+use_response_val[1]+'</span></a>' : '' //category별 탭이름
      tabHtml += (String(theTarget.sam_speaker_menu)==='1') ? '<a href="./speaker_list.html?id='+MODULE_ID+'&m_id='+MEMBER_ID+'" class="active"><span>'+use_response_val[2]+'</span></a>' : '<div></div>' ;
      tabHtml += (String(theTarget.sam_category_menu)!=='1') ? '<div></div>' : ''
      if (String(theTarget.sam_category_menu)==='0' && String(theTarget.sam_speaker_menu)==='0') {
        tabHtml = '';
        var el = document.querySelector('.top-fixed-menu')
        el.parentNode.removeChild(el);
        // $('.top-fixed-menu').remove();
      }else if(String(theTarget.sam_speaker_menu)==='0'){
        var el = document.querySelector('.top-fixed-menu')
        el.parentNode.removeChild(el);
      }else{
        document.querySelector('.tab_wrap').innerHTML = tabHtml;
      }
      COLOR_CODE[1] = theTarget.color_2;
      COLOR_CODE[2] = theTarget.color_3;

      var bigint = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(COLOR_CODE[1]);
      var r = parseInt(bigint[1], 16);
      var g = parseInt(bigint[2], 16);
      var b = parseInt(bigint[3], 16);
      COLOR_CODE[3] = r + "," + g + "," + b;
      var style_code = '.tab_wrap a.active, .tab_wrap a:hover{background-color:'+COLOR_CODE[1]+';color:'+COLOR_CODE[2]+'}'
      style_code += '.tab_wrap a.active>span,.tab_wrap a:hover>span{background-color:'+COLOR_CODE[1]+';color:'+COLOR_CODE[2]+';}'
      style_code += '.tab_wrap a.active>span:before, .tab_wrap a.active>span:after, .tab_wrap a:hover>span:before, .tab_wrap a:hover>span:after{background-color:'+COLOR_CODE[1]+';}';
      style_code += '.tab_wrap{border-color:'+COLOR_CODE[1]+'!important;}'
      style_code += '.ab_title-h1{color: '+COLOR_CODE[1]+'}'
      style_code += '.circle-cnt_num{border-color:'+COLOR_CODE[1]+';color:'+COLOR_CODE[1]+'}'

      $('body').prepend('<style>'+style_code+'</style>');
      localStorage.setItem('color_code',JSON.stringify(COLOR_CODE));
      getSpeakerList();
    });
  }

  function getSpeakerList(){
    var dataObj = {
      "search" : search,
      "letter_search" : letter_search,
      "module_id":MODULE_ID,
      "lang":LANG_TYPE
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
    $.ajax(settings).done(function (server_response) {
      var listHtml = ''
      var response = sortResponse(server_response,sort_type)
      console.log(response)
      for (var i = 0; i < response.length; i++) {
        var is_order_bg = (response[i].order !='0') ? ' bg-order' : ''
        var use_response_val = [response[i].speaker_name,response[i].speaker_institute];
        if (LANG_TYPE=='en') {
          use_response_val = [response[i].speaker_name_en,response[i].speaker_institute_en];
        }
        var is_count = (Number(response[i].sam_count)>1) ? '<span class="circle-cnt_num">'+response[i].sam_count+'</span>' : ''
        listHtml += '<div class="ab_cnt'+is_order_bg+'"><table class="ab_table"><tr><td>'
        listHtml += '<div class="img-ratio_wrap"><div class="img-ratio_h"><div class="img-ratio_cen">'
        var this_img = (response[i].speaker_photo_1!="") ? response[i].speaker_photo_1 : './static/images/img_human.png'
        listHtml += '<img src="'+this_img+'" alt="">'
        listHtml += '</div></div></div></td>'
        listHtml += '<td class="ab_title"><h1 class="ab_title-h1" data-value="'+response[i].speaker_name+'">'+use_response_val[0]+'</h1>'
        listHtml += '<p class="ab_info" data-value="'+response[i].speaker_institute+'">'+use_response_val[1]+'</p></td>'
        listHtml += '<td>'+is_count+'</td>'
        listHtml += '</tr></table></div>'
      }
      document.querySelector('.speaker_cnt_wrap').innerHTML = listHtml;
      var el = document.querySelector('.top-fixed-menu')
      if (el) {
        var top_fix_h = $('.top-fixed-menu').height() + 31;
        document.querySelector('.speaker_wrap').style.paddingTop = top_fix_h +'px'
      }
      $(window).scrollTop(SCROLL_OBJ['speaker_list'])
    });
  }

  function getThisSpeakerSam(){
    var name = $(this).find('.ab_title-h1').attr('data-value');
    var institute = $(this).find('.ab_info').attr('data-value');
    var this_cnt = this.querySelector('.circle-cnt_num')
    var dataObj = {
      "speaker_name":name,
      "speaker_institute":institute,
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
      SCROLL_OBJ['speaker_list'] = window.scrollY
      localStorage.setItem('scroll_value',JSON.stringify(SCROLL_OBJ))
      if (this_cnt==null) {
        location.href = 'ab_detail.html?id='+response[0].id;
      }else{
        // 초록 리스트 페이지로 이동
        location.href = 'speaker_detail.html?id='+MODULE_ID+'&name='+escape(name)+'&institute='+escape(institute)
      }
    });
  }

  function selectTerm(){
    var sel_val = this.value;
    var el = document.querySelector('.selected_txt')
    if (sel_val=='all') {
      $('.selected_txt').remove();
    }else{
      if (el!=null) {
        el.innerHTML = sel_val
      }else{
        $('.selected_txt').remove();
        $('.speaker_search_wrap').append('<span class="selected_txt">'+sel_val+'</span>')
      }
    }
    var el = document.querySelector('.input_txt')
    if (el!=null) {
      el.parentNode.removeChild(el);
    }
    letter_search = (sel_val!='all') ? sel_val : '';
    search = '';
    document.querySelector('#searchInput').value = '';
    MainModule.hidePop()
    // document.querySelector('.pop_bg').style.display = 'none';
    // document.querySelector('.pop_wrap').style.display = 'none';
    getSpeakerList()
  }

  function searchText(){
    var el = document.querySelector('.input_txt')
    if (el!=null) {
      el.parentNode.removeChild(el);
    }
    el = document.querySelector('.selected_txt')
    if (el!=null) {
      el.parentNode.removeChild(el);
    }
    $('input[name="term"]').attr('checked',false);
    letter_search = '';
    search = document.querySelector('#searchInput').value;
    MainModule.hidePop()
    // document.querySelector('.pop_bg').style.display = 'none';
    // document.querySelector('.pop_wrap').style.display = 'none';
    if (search!="") {
      $('.speaker_search_wrap').append('<span class="selected_txt input_txt">'+search+'</span>')
    }
    // document.body.style.overflow = 'auto';
    getSpeakerList()
  }

  function showPop(){
    MainModule.showPopHeightVertical();
    var el_height = vh(40);
    if (el_height>=$('.js-term_height').height()) {
      $('.ic_scroll_wrap').remove();
    }
    document.body.style.overflow = 'hidden';
  }

  function changeListSort(){
    if (this.checked) {//한글 > 영여
      sort_type = 'ko'
    }else{//영어 > 한글
      sort_type = 'en'
    }
    getSpeakerList()
  }

  function sortResponse(obj,type){
    var return_obj = obj
    var check_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/; // 한글체크
    var check_eng = /[a-zA-Z]/; // 문자
    if (type!=null) {
      var order_obj = return_obj.map(function(value){
        if (value.order!="0" && value.order!="") {
          return value
        }
      }).filter(isNotEmpty);
      var ko_obj = return_obj.map(function(value){
        if (value.order=="0" || value.order=="") {
          if (LANG_TYPE=='en') {
            if (check_kor.test(value.speaker_name_en.substring(0,1))) {
              return value
            }
          }else{
            if (check_kor.test(value.speaker_name.substring(0,1))) {
              return value
            }
          }
        }
      }).filter(isNotEmpty);
      ko_obj.sort(function (a, b) {
        if (LANG_TYPE=='en') {
          var a_target = a.speaker_name_en.substring(0,1).toLowerCase()
          var b_target = b.speaker_name_en.substring(0,1).toLowerCase()
          return a_target < b_target ? -1 : a_target > b_target ? 1 : 0;
        }else{
          var a_target = a.speaker_name.substring(0,1).toLowerCase()
          var b_target = b.speaker_name.substring(0,1).toLowerCase()
          return a_target < b_target ? -1 : a_target > b_target ? 1 : 0;
        }
      });
      var en_obj = return_obj.map(function(value){
        if (value.order=="0" || value.order=="") {
          if (LANG_TYPE=='en') {
            if (check_eng.test(value.speaker_name_en.substring(0,1))) {
              return value
            }
          }else{
            if (check_eng.test(value.speaker_name.substring(0,1))) {
              return value
            }
          }
        }
      }).filter(isNotEmpty);
      en_obj.sort(function (a, b) {
        if (LANG_TYPE=='en') {
          var a_target = a.speaker_name_en.substring(0,1).toLowerCase()
          var b_target = b.speaker_name_en.substring(0,1).toLowerCase()
          return a_target < b_target ? -1 : a_target > b_target ? 1 : 0;
        }else{
          var a_target = a.speaker_name.substring(0,1).toLowerCase()
          var b_target = b.speaker_name.substring(0,1).toLowerCase()
          return a_target < b_target ? -1 : a_target > b_target ? 1 : 0;
        }
      });
      if (type=='ko') {//한글먼저 나오도록
        return_obj = order_obj.concat(ko_obj,en_obj);
      }else{//영어먼저 나오도록
        return_obj = order_obj.concat(en_obj,ko_obj);
      }
    }
    return return_obj;
  }

  function isNotEmpty(value){
    return value != undefined;
  }

  function changeSortType(value){
    localStorage.setItem('sort_type',value);
    location.href = './ab.html?id='+MODULE_ID+'&m_id='+MEMBER_ID
  }

  return {
    init : init,
    changeSortType:changeSortType
  };
})();
(function () {
    SpeakerListModule.init();
})();
