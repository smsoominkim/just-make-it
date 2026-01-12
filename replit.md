# 일단만들어 (Just Make It) - LMS Platform

## Overview
태재 AI 바이브 코딩 아카데미 수강생 전용 폐쇄형 LMS 및 커뮤니티 플랫폼입니다.
복잡한 기능 없이 '수업 수강'과 '과제 공유'에만 집중하는 직관적인 UI를 제공합니다.

## Features
- **이메일 기반 인증**: 간편한 회원가입 및 로그인
- **탭 기반 네비게이션**: 아카데미 개요 + 5주차 콘텐츠
- **주차별 학습 페이지**: YouTube 강의 영상, 자료 다운로드, 주차별 과제 표시
- **과제 게시판**: 마크다운 에디터 + 이미지 업로드, 댓글 기능
- **관리자 페이지**: 콘텐츠, 회원, 게시글, 주차별 과제 관리
- **다크 모드 지원**: 라이트/다크 테마 전환

## Project Structure
```
client/
  src/
    components/
      layout/           # 네비게이션, 메인 레이아웃
      ui/               # Shadcn UI 컴포넌트
      post-editor.tsx   # 과제 작성 에디터
      theme-provider.tsx
      theme-toggle.tsx
    lib/
      auth.tsx          # 인증 컨텍스트
      queryClient.ts    # React Query 설정
    pages/
      login.tsx         # 로그인 페이지
      register.tsx      # 회원가입 페이지
      academy-overview.tsx  # 아카데미 개요
      weekly-page.tsx   # 주차별 학습 페이지
      post-detail.tsx   # 게시글 상세
      admin.tsx         # 관리자 페이지
    App.tsx             # 라우팅 설정
server/
  routes.ts             # API 엔드포인트
  storage.ts            # 인메모리 스토리지
shared/
  schema.ts             # 데이터 모델 및 유효성 검사
```

## API Endpoints
### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

### 콘텐츠
- `GET /api/academy-overview` - 아카데미 개요
- `PUT /api/academy-overview` - 개요 수정 (관리자)
- `GET /api/weekly-content/:weekNumber` - 주차별 콘텐츠

### 게시글
- `GET /api/posts/:weekNumber` - 주차별 게시글 목록
- `GET /api/posts/detail/:id` - 게시글 상세
- `POST /api/posts` - 게시글 작성

### 댓글
- `GET /api/comments/:postId` - 게시글 댓글
- `POST /api/comments` - 댓글 작성
- `DELETE /api/comments/:id` - 댓글 삭제 (작성자 또는 관리자)

### 미디어 업로드
- `POST /api/uploads` - 이미지 업로드 (인증 필요, 5MB 제한)
- `GET /api/uploads/:id` - 업로드된 이미지 조회

### 관리자
- `GET /api/admin/weekly-content` - 전체 주차 콘텐츠
- `PUT /api/admin/weekly-content/:weekNumber` - 주차 콘텐츠 수정 (과제 포함)
- `GET /api/admin/users` - 회원 목록
- `DELETE /api/admin/users/:id` - 회원 삭제
- `GET /api/admin/posts` - 게시글 목록
- `DELETE /api/admin/posts/:id` - 게시글 삭제

## Default Accounts
- 관리자: `admin@justmakeit.com` / `admin123`

## Technology Stack
- **Frontend**: React, Vite, TailwindCSS, Shadcn UI, React Query
- **Backend**: Express.js, In-memory storage
- **Routing**: Wouter
- **Forms**: React Hook Form + Zod validation

## Development
```bash
npm run dev
```
서버가 포트 5000에서 실행됩니다.
