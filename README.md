# pbl_auto_login_front

Vue 3 + Vite frontend for auto-login flow.

## Scripts
- `npm install`
- `npm run dev` (기본적으로 `55559`에서 실행)
- `npm run build`

## Setup
- 프로젝트 루트의 `config.json`을 사용합니다.
  - `apiBase`: `http://localhost:55558`
  - `targetUrl`: `https://pbl-llm.vercel.app`
  - `launchTokenEndpoint`: `/api/launch-token`
  - `launchTokenQuery`: `authrt_id`

## Flow
- `POST /api/login` → save `access_token` in localStorage and move to `/dashboard`
- `Dashboard`에서 로그인 완료 시 `서비스 열기` 버튼이 보이며 설정된 URL을 새 탭으로 엽니다.
- 현재 단계에서는 아이디/비밀번호 직접 입력 기반 로그인만 사용합니다. (`/api/auto-login`은 사용하지 않음)

## Interface Guide

- 상세 문서: `interface.md`
- 로그인 폼, 대시보드 서비스 열기 버튼, `cntn_key` 전달 규격, 로컬스토리지 키 동작을 정리했습니다.

로그인 실패 시 백엔드가 `Unable to verify credentials.` 를 주면, 백엔드 `/health`를 먼저 확인하세요.


테스트 계정 예시: `lhj` / `1234`
