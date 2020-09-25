var QuestionListModule = (function(){
  var $root
  var MODULE_ID
  var SAM_ID;
  var CODE;
  var reloadTimer
  var SCROLL_TOP;
  var LANG_TYPE;
  var COLOR_CODE = ['x','메인색상','메인색상내부글자색상','RGB색상'];
  function init(){
    $root = $('.wrap');
    MODULE_ID = MainModule.getSomeUrl('id')
    SAM_ID = MainModule.getSomeUrl('s_id')
    CODE = MainModule.getSomeUrl('code')
    SCROLL_TOP = MainModule.getSomeUrl('sc');
    SCROLL_TOP = (SCROLL_TOP=='') ? 0 : SCROLL_TOP
    LANG_TYPE = MainModule.getLocalStorage();
    COLOR_CODE = MainModule.getColorLocalStorage();
    setColorStyle();
    eventBind();
    getQuestionList();
  }

  function setColorStyle(){
    var style_code = '.question_name{color:'+COLOR_CODE[1]+';}'
    $('body').prepend('<style>'+style_code+'</style>');
  }

  function eventBind(){
    $root.on('click','.js-del',deleteQuestion)
    $root.on('click','.js-showQuestionPop',showQuestionPop)
    $('body').on('click','.pop_btn-x span',endStartTimer)
  }

  function getQuestionList(){
    var dataObj = {
      "session_talk_code":CODE,
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
      var listHml = '';
      for (var i = 0; i < response.length; i++) {
        listHml += '<div class="question_cnt"><table class="question_table js-showQuestionPop">'
        listHml += '<tr><td><div class="img-ratio_wrap"><div class="img-ratio_h"><div class="img-ratio_cen">'
        var this_photo = (response[i].speaker_photo_1!='') ? response[i].speaker_photo_1 : './static/images/img_human.png'
        listHml += '<img src="'+this_photo+'" alt="">' // img
        listHml += '</div></div></div></td>'
        var is_name = (LANG_TYPE=='en') ? response[i].speaker_name_en : response[i].speaker_name
        var is_speaker_name = (is_name!="") ? is_name : 'TO ALL'
        listHml += '<td class="question_name">'+is_speaker_name+'</td><td><span class="question_ic-del js-del" data-id="'+response[i].id+'"></span></td></tr>'
        listHml += '<tr><td class="question_content-txt" colspan="3">'+response[i].content.replace(/(\r\n|\n|\r)/gm, "<br>")+'</td></tr>'
        listHml += '<tr><td class="question_date-txt" colspan="3">'+response[i].created_at+'</td></tr>'
        listHml += '</table></div>'
      }
      document.querySelector('.wrap_w').innerHTML = listHml;
      $(document).scrollTop(SCROLL_TOP)
      endStartTimer()
    }).fail(function(response){
      if (response.status==410) {
        alert('Validation error')
      }else if(response.status==411){
        alert('해당 모듈을 찾을 수 없습니다.')
      }
    });
  }

  function deleteQuestion(){
    if (confirm('삭제하시겠습니까? 삭제된 내용은 되돌릴 수 없습니다.')) {
      var post_id = $(this).attr('data-id');
      var settings = {
        "async": true,
        "url": "/api/v1/sam/session_talk/"+post_id+"/delete_session_talk",
        "method": "POST",
        "headers": {
            "accept": "application/json"
        }
      }
      $.ajax(settings).done(function (response) {
        getQuestionList()
      }).fail(function(response){
        if (response.status==411) {
          alert('해당 게시글을 찾을 수 없습니다.')
        }
      });
    }
  }

  function endStartTimer(){
    reloadTimer =  setTimeout(function(){
      var scroll_val = $(document).scrollTop();
      location.href= './question_list.html?id='+MODULE_ID+'&s_id='+SAM_ID+'&code='+CODE+'&sc='+scroll_val
    },5000)
  }

  function showQuestionPop(e){
    if (!$(e.target).hasClass('js-del')) {
      var pop_name = this.querySelector('.question_name').innerHTML;
      var pop_content = this.querySelector('.question_content-txt').innerHTML;
      var pop_date = this.querySelector('.question_date-txt').innerHTML;
      document.querySelector('.h1-pop_title').innerHTML = pop_name;
      document.querySelector('.question_text').innerHTML = pop_content;
      document.querySelector('.question_date_text').innerHTML = pop_date;
      var el = document.querySelector('.pop_wrap')
      document.querySelector('.pop_bg').style.display = 'block';
      el.style.display = "block"
      el.style.visibility = "hidden"
      el.style.margin = (($(window).height()-$(".pop_wrap").outerHeight())/2+$(window).scrollTop()) + 'px 0 0 0';
      el.style.visibility = 'visible'
      clearTimeout(reloadTimer);
    }
  }

  return {
    init : init
  };
})();
(function () {
    QuestionListModule.init();
})();
