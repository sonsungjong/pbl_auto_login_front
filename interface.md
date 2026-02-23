# pbl_auto_login_front 인터페이스 문서

## 1. 개요
`pbl_auto_login_front`는 자동로그인 워크플로우를 위한 Vue 3 프론트엔드입니다.
- 기본 실행 포트: `55559`
- 라우트: `/login`, `/dashboard`
- 목적
  - 사용자 직접 로그인
  - 로그인 성공 시 자동로그인 토큰 발급 API 호출
  - `targetUrl`로 새 창 열기(`authrt_id` 쿼리 전달)

---

## 2. 환경 설정 (`config.json`)

`src/config.js`에서 다음 값으로 로딩합니다.

```json
{
  "apiBase": "http://localhost:55558",
  "targetUrl": "https://pbl-llm.vercel.app",
  "launchTokenEndpoint": "/api/launch-token",
  "launchTokenQuery": "authrt_id"
}
```

### 파생 상수
- `API_BASE = appConfig.apiBase`
- `TARGET_URL = appConfig.targetUrl`
- `LAUNCH_TOKEN_ENDPOINT = appConfig.launchTokenEndpoint`
- `LAUNCH_TOKEN_QUERY = appConfig.launchTokenQuery`

---

## 3. 라우팅

`src/main.js`

- `GET /` → `/login` redirect
- `GET /login` → `Login` 페이지
- `GET /dashboard` → `Dashboard` 페이지
- 미정의 경로 → `/login`

---

## 4. 화면 및 인터페이스 상세

### 4.1 로그인 화면 (`/login`) – `views/Login.vue`

#### 입력
- `userId`: 사용자 ID
- `password`: 비밀번호

#### 액션
- 로그인 폼 submit(`onSubmit`)
  - `POST ${API_BASE}/api/login`
  - headers: `Content-Type: application/json`
  - body:
    ```json
    {
      "user_id": "<userId>",
      "pw": "<password>"
    }
    ```
  - `credentials: include`

#### 성공 처리
- `res.ok === true`인 경우:
  - `data.access_token`을 `localStorage.token`에 저장
  - `data.user`를 `localStorage.user`에 저장
  - `router.push('/dashboard')`

#### 실패 처리
- 비정상 응답이면 `data.message`를 `error`로 노출
- 예외: `error` 메시지 표시

#### 상태
- `loading`: bool
- `error`, `info`: 상태 텍스트

---

### 4.2 대시보드 (`/dashboard`) – `views/Dashboard.vue`

#### 표시 상태
- 로그인 사용자 정보: `user.user_id`
- 버튼
  - 서비스 열기 (`openTargetApp`)
  - 로그아웃 (`logout`)

#### `서비스 열기` 인터페이스

1. 입력 가드
   - `user.user_id`와 `opening` 상태 확인
2. 요청
   - `POST ${API_BASE}${LAUNCH_TOKEN_ENDPOINT}`
   - headers: `Content-Type: application/json`
   - body:
     ```json
     { "user_id": "<user_id>" }
     ```
   - `credentials: include`
3. 성공 시 응답:
   ```json
   {
     "user_id": "lhj",
     "authrt_id": 123456789,
     "expires_in": 30
   }
   ```
4. `authrt_id`를 추출해 URL 구성
   ```text
   ${TARGET_URL}?${LAUNCH_TOKEN_QUERY}=<authrt_id>
   # 예: https://pbl-llm.vercel.app?authrt_id=123456789
   ```
5. `window.open(url, '_blank', 'noopener,noreferrer')`

#### 로그아웃
- `localStorage.token`, `localStorage.user` 삭제
- `/login`으로 이동

---

## 5. 로컬 스토리지 인터페이스

### 키 목록
- `token`
  - 타입: string
  - `POST /api/login` 성공 시 저장되는 JWT

- `user`
  - 타입: JSON string
  - 최소 구조:
    ```json
    { "user_id": "lhj" }
    ```

### 만료/초기화
- 현재 구현에서 명시적 만료 시간 관리는 없음
- 로그아웃 시 삭제
- 페이지 초기 마운트 시 `user`만 읽어 인증 여부 판단에 사용

---

## 6. 오류 인터페이스 (Frontend 노출)

- 로그인 실패
  - `error` 상태: 백엔드 응답 `message` 또는 기본 메시지
- 자동열기 토큰 생성 실패
  - `openTargetApp` 에러를 `error` 상태로 노출
- 서버 미응답/비정상 응답
  - `알 수 없는 오류`, `토큰 생성에 실패했습니다.` 등

---

## 7. 보안/호출 제약

- `launch token` 생성은 로그인 상태 기반으로 진행되므로, `user` 상태가 없으면 호출되지 않음
- 실제 자동로그인 검증은 타깃 서비스에서 수행됨
- 새 창(`window.open`)은 `noopener,noreferrer` 적용

---

## 8. 테스트 체크리스트

1. 백엔드가 `http://localhost:55558`(혹은 설정값)에서 정상 기동
2. `POST /api/login` with `lhj/1234` 성공
3. 대시보드 이동 후 `서비스 열기`
4. `targetUrl`에 `?authrt_id=...` 형태의 쿼리 포함되어 새 창 오픈 확인

---

## 9. 인터페이스 동작 범위

이 문서는 현재 상태 기준으로 다음 인터페이스를 정의합니다.
- 로그인: **직접 입력 기반**
- 자동로그인 토큰 생성: `/api/launch-token`
- 자동로그인 토큰 검증: 타깃 앱(`pbl_llm`/`pbl_back`)에서 구현
