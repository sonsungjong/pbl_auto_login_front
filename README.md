# pbl_auto_login_front

Vue 3 + Vite frontend for auto-login flow.

## Scripts
- `npm install`
- `npm run dev` (기본적으로 `55559`에서 실행)
- `npm run build`

## Setup
- `cp .env.example .env`
- 기본 API 주소: `VITE_API_BASE` (기본값 `http://localhost:55558`)
- 서비스 새 창 URL: `VITE_TARGET_URL` (기본값 `http://localhost:54322`)

## Flow
- `POST /api/login` → save `access_token` in localStorage and move to `/dashboard`
- `Dashboard`에서 로그인 완료 시 `서비스 열기` 버튼이 보이며 설정된 URL을 새 탭으로 엽니다.
- 현재 단계에서는 아이디/비밀번호 직접 입력 기반 로그인만 사용합니다. (`/api/auto-login`은 사용하지 않음)

로그인 실패 시 백엔드가 `Unable to verify credentials.` 를 주면, 백엔드 `/health`를 먼저 확인하세요.


테스트 계정 예시: `lhj` / `1234`
