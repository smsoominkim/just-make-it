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
  assignment: string;
}

export const insertWeeklyContentSchema = z.object({
  weekNumber: z.number().min(1).max(5),
  title: z.string().min(1, "제목을 입력해주세요"),
  youtubeUrl: z.string().url("유효한 URL을 입력해주세요"),
  materialsUrl: z.string().url("유효한 URL을 입력해주세요"),
  assignment: z.string().optional(),
});

export type InsertWeeklyContent = z.infer<typeof insertWeeklyContentSchema>;

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
  imageUrl: z.string().url("유효한 이미지 URL을 입력해주세요").optional(),
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
    assignment: "내 서비스 기획안(PRD) 작성하고 핵심 기능을 웹으로 구현하기",
  },
  {
    weekNumber: 2,
    title: "Mobile App Expansion: 내 서비스를 앱으로 확장",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    materialsUrl: "https://drive.google.com/",
    assignment: "나의 웹 서비스를 모바일 앱으로 만들기",
  },
  {
    weekNumber: 3,
    title: "Market Ready: 실전 같은 오류 해결과 마케팅",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    materialsUrl: "https://drive.google.com/",
    assignment: "나의 서비스 오류를 수정하고 구글 검색에 걸리게 설정하기",
  },
  {
    weekNumber: 4,
    title: "Agentic AI Workflow: 스스로 일하는 AI 만들기",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    materialsUrl: "https://drive.google.com/",
    assignment: "내 서비스에 Agentic AI 워크플로우 적용해서 고도화하기",
  },
  {
    weekNumber: 5,
    title: "High-End UX & Control: 프로덕트 완성도 높이기",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    materialsUrl: "https://drive.google.com/",
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
