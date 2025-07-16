## 나만의 점심 메뉴 추천 사이트 : 점심의 아이
## **주요 기능**

- **주어진 키워드에 맞는 점심 메뉴 추천 기능**
    - 사용자가 키워드를 선택 후 추천 요청
    - 일주일치 점심 메뉴 추천 가능
    - 주변 맛집을 기준으로 메뉴 추천(사용자 위치 기준)
- **정해진 점심 메뉴를 캘린더와 연결하여 표현**
    - 데이터 저장과 사용자 구분을 위한 로그인, 회원가입 기능 구현
    - 추천 메뉴가 계속 기록되서 내가 점심에 뭘 먹었는지 리마인드 가능
  ## 기능 구현 계획

- **사용할 API**
    - 네이버 API LIST 바로가기 https://developers.naver.com/apps/#/list
    - GPT : OpenAI API (gpt-3.5 or gpt-4)
    - 네이버 검색 API - 블로그 / 지역검색(local)
        
        [검색 - SERVICE-API](https://developers.naver.com/products/service-api/search/search.md)
        
        - 요청 GET방식 예시
            
            GET https://openapi.naver.com/v1/search/local.json?query=노고산동 김치찌개
            &display=5
            &start=1
            &sort=random
            
            이런 식으로 GPT가 준 음식별로 { 메뉴 이름 + 주소 정보 } 로 쿼리문 생성, 쿼리문은 문장형이 아닌 저런식으로 딱 떨어지는게 중요함
            
    
    - 네이버 지도 API
        
        [NAVER Maps API v3](https://navermaps.github.io/maps.js.ncp/)
        
    
- **API 응답 구조**
    - 주어진 키워드에 따른 정해진 프롬프트를 GPT에 요청
        - ex: 중식, 한식 ⇒ 프롬프트 예시: {중식, 한식}을 기준으로 음식 메뉴 추천해줘, 응답은 음식이름1,음식이름2,.. 이런틀을 지켜서 응답해
    - GPT API에서 받아온 응답과 사용자가 정한 위치정보를 이용해 네이버 검색 API에게 보낼 검색어를 설정
        - EX: 마포구 노고산동에 위치한 김치찌게집
    - 검색 API에서 받아온 가게 정보를 사용자에게 표현, 네이버 지도API를 이용해 지도에 표시
- **데이터 베이스 구조**

---

## **사용할 기술 스택**

- **React Native(Visual Code) - 프론트**
- **Next-JS(Visual Code) - 백엔드**
- **MariaDB(HeidiSQL) - 데이터 베이스**
