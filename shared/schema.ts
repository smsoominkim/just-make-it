import { z } from "zod";

// User schema
export interface User {
  id: string;
  email: string;
  password: string;
  nickname: string;
  role: "student" | "admin";
}

export const insertUserSchema = z.object({
  email: z.string().email("유효한 이메일을 입력해주세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
  nickname: z.string().min(2, "닉네임은 최소 2자 이상이어야 합니다"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

export const loginSchema = z.object({
  email: z.string().email("유효한 이메일을 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Weekly Content schema
export interface WeeklyContent {
  id: string;
  weekNumber: number;
  title: string;
  youtubeUrl: string;
  materialsUrl: string;
  learningObjectives: string;
  assignment: string;
}

export const insertWeeklyContentSchema = z.object({
  weekNumber: z.number().min(1).max(5),
  title: z.string().min(1, "제목을 입력해주세요"),
  youtubeUrl: z.string().refine((val) => val === "" || /^https?:\/\/.+/.test(val), {
    message: "유효한 URL을 입력해주세요",
  }).optional(),
  materialsUrl: z.string().refine((val) => val === "" || /^https?:\/\/.+/.test(val), {
    message: "유효한 URL을 입력해주세요",
  }).optional(),
  learningObjectives: z.string().optional(),
  assignment: z.string().optional(),
});

export type InsertWeeklyContent = z.infer<typeof insertWeeklyContentSchema>;

export const updateWeeklyContentSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  youtubeUrl: z.string().default(""),
  materialsUrl: z.string().default(""),
  learningObjectives: z.string().default(""),
  assignment: z.string().default(""),
});

export type UpdateWeeklyContent = z.infer<typeof updateWeeklyContentSchema>;

// Academy Overview schema
export interface AcademyOverview {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export const updateAcademyOverviewSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  description: z.string().min(1, "설명을 입력해주세요"),
  imageUrl: z.string().refine((val) => val === "" || /^https?:\/\/.+/.test(val), {
    message: "유효한 이미지 URL을 입력해주세요",
  }).optional(),
});

export type UpdateAcademyOverview = z.infer<typeof updateAcademyOverviewSchema>;

// Post schema
export interface Post {
  id: string;
  weekNumber: number;
  title: string;
  content: string;
  authorId: string;
  authorNickname: string;
  createdAt: string;
  isNotice: boolean;
}

export const insertPostSchema = z.object({
  weekNumber: z.number().min(0).max(6),
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  isNotice: z.boolean().optional(),
});

export type InsertPost = z.infer<typeof insertPostSchema>;

// Comment schema
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorNickname: string;
  content: string;
  createdAt: string;
}

export const insertCommentSchema = z.object({
  postId: z.string(),
  content: z.string().min(1, "댓글 내용을 입력해주세요"),
});

export type InsertComment = z.infer<typeof insertCommentSchema>;

// Media Asset schema (for image uploads)
export interface MediaAsset {
  id: string;
  filename: string;
  mimeType: string;
  data: string;
  createdAt: string;
}

// Default weekly content data
export const defaultWeeklyContent: Omit<WeeklyContent, "id">[] = [
  {
    weekNumber: 1,
    title: "AI-Native Creation: 웹 서비스 기획부터 배포까지",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    materialsUrl: "https://drive.google.com/",
    learningObjectives: `1. 전체 개발 Stack을 이해한다. (GUI-프론트 - 백엔드/DB-API-배포-운영)
2. Replit 환경에서 PM 레벨의 프롬프팅 기법을 통해 웹 앱 프로젝트를 생성하고 기본 구조를 설계한다.
3. Replit DB를 연동하여 회원가입 및 데이터 저장/수정/삭제 기능을 구현한다.
4. 외부 API를 연결한다.
5. 웹 서비스를 온라인에 배포한다.`,
    assignment: "내 서비스 기획안(PRD) 작성하고 핵심 기능을 웹으로 구현하기",
  },
  {
    weekNumber: 2,
    title: "Mobile App Expansion: 내 서비스를 앱으로 확장",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    materialsUrl: "https://drive.google.com/",
    learningObjectives: `1. React Native를 활용하여 새 모바일 앱을 만든다.
2. React Native의 기본 개념과 웹(React)과의 차이점을 이해한다.
3. AI의 도움을 받아 기존 웹 프로젝트 코드를 React Native 코드로 변환한다.
4. 모바일 시뮬레이터 또는 실제 기기에서 내가 만든 앱을 실행하고 테스트한다.`,
    assignment: "나의 웹 서비스를 모바일 앱으로 만들기",
  },
  {
    weekNumber: 3,
    title: "Market Ready: 실전 같은 오류 해결과 마케팅",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    materialsUrl: "https://drive.google.com/",
    learningObjectives: `1. AI 디버깅을 통해 서비스의 오류를 찾아 수정한다.
2. 발생한 오류를 유형별로 카테고리화하고, 케이스별 수정 전략을 수립하여 문제 해결 능력을 기른다.
3. AI에게 명확한 수정 지시를 내리고 결과물을 검증하는 고도화된 AI 매니징 스킬을 체득한다.
4. 메타 태그 설정 등을 통해 서비스의 구글 노출 및 링크 클릭률을 극대화한다.`,
    assignment: "나의 서비스 오류를 수정하고 구글 검색에 걸리게 설정하기",
  },
  {
    weekNumber: 4,
    title: "Agentic AI Workflow: 스스로 일하는 AI 만들기",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    materialsUrl: "https://drive.google.com/",
    learningObjectives: `1. Mission-Context-Work 프레임워크를 적용하여 AI를 시니어 개발자처럼 부리는 리더십을 익힌다.
2. 사용자 관심사 기반 매일 지정된 시간에 뉴스레터를 자동 생성하고 발송하는 서비스를 구현한다.
3. 서비스가 죽거나 에러가 났을 때 이메일/슬랙으로 알림이 오도록 설정하여 24시간 관제 시스템을 만든다.`,
    assignment: "내 서비스에 Agentic AI 워크플로우 적용해서 고도화하기",
  },
  {
    weekNumber: 5,
    title: "High-End UX & Control: 프로덕트 완성도 높이기",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    materialsUrl: "https://drive.google.com/",
    learningObjectives: `1. 디자인 시스템 통일과 정교한 상태 피드백(GUI)을 구현하여 상용 서비스 수준의 사용자 경험을 완성한다.
2. 데이터베이스에 직접 접속하지 않고도, 웹에서 회원 정보 등을 핵심 데이터를 조회/수정/삭제하는 데이터 관리자 페이지를 구축한다.
3. 서비스 아키텍처와 API 연결 상태 등을 시각화한 시스템 관리자 페이지를 구축한다.`,
    assignment: "최종 서비스 만들고 주변에 알리기",
  },
];

// Post template
export const postTemplate = `1. 앱 이름 및 컨셉
- 

2. 이번 주 작업 내용
- 

3. 업데이트된 프로젝트 링크
- 

4. 어려웠던 점 및 질문
- 

5. 회고
- `;
