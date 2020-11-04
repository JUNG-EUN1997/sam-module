SAM module
=============
> speaker, category, session 별 연자리스트 통합 모듈

2020-10-16
-------------
> first create README.md
> 1. Speaker list 에서, 발표자 이름이 존재하지 않을 시, sort시 값이 사라지는 현상 발견 (수정필요)
> 2. session_name, room 정보의 en 정보 추가됨 (csv 참고)

2020-10-23
-------------
1. session_name_en 과 room_en 정보 구분 추가
2. ab_detail에 speaker name과 speaker_institute_en 간 줄바꿈 추가

2020-10-26
-------------
1. sam모듈 스타일 및 데이터 노출 위치 수정

2020-10-27
-------------
1. speaker list 정렬 기본으로 글자순 정렬되도록 기능 추가

2020-10-29
-------------
1. 소속(speaker_title, speaker_title_en),이름(speaker_name, speaker_name_en) 이 동일하면 한 사람으로 노출되도록 수정
2. speaker list 에서 location시 title 가져가도록 추가
3. speaker detail에서 title 전송 및 소스수정

2020-10-30
-------------
1. confirm, alert 등 브라우저 팝업 안뜨는 문제 custom 팝업으로 수정
2. speaker list 에서 ajax return 값이 없어도 이동되도록 수정

2020-11-04
-------------
1. like_list 사진유무로 speaker, session 타입나눔 