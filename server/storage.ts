import { randomUUID } from "crypto";
import type {
  User,
  InsertUser,
  WeeklyContent,
  UpdateWeeklyContent,
  AcademyOverview,
  UpdateAcademyOverview,
  Post,
  InsertPost,
  Comment,
  InsertComment,
  MediaAsset,
} from "@shared/schema";
import { defaultWeeklyContent } from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;

  getWeeklyContent(weekNumber: number): Promise<WeeklyContent | undefined>;
  getAllWeeklyContent(): Promise<WeeklyContent[]>;
  updateWeeklyContent(weekNumber: number, content: UpdateWeeklyContent): Promise<WeeklyContent | undefined>;

  getAcademyOverview(): Promise<AcademyOverview>;
  updateAcademyOverview(data: UpdateAcademyOverview): Promise<AcademyOverview>;

  createPost(authorId: string, authorNickname: string, post: InsertPost): Promise<Post>;
  getPost(id: string): Promise<Post | undefined>;
  getPostsByWeek(weekNumber: number): Promise<Post[]>;
  getAllPosts(): Promise<Post[]>;
  updatePost(id: string, data: { title: string; content: string }): Promise<Post | undefined>;
  deletePost(id: string): Promise<void>;
  getUserPostsByWeek(userId: string, weekNumber: number): Promise<Post[]>;

  createComment(authorId: string, authorNickname: string, comment: InsertComment): Promise<Comment>;
  getComment(id: string): Promise<Comment | undefined>;
  getCommentsByPost(postId: string): Promise<Comment[]>;
  deleteComment(id: string): Promise<void>;

  createMediaAsset(filename: string, mimeType: string, data: string): Promise<MediaAsset>;
  getMediaAsset(id: string): Promise<MediaAsset | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private weeklyContent: Map<number, WeeklyContent>;
  private academyOverview: AcademyOverview;
  private posts: Map<string, Post>;
  private comments: Map<string, Comment>;
  private mediaAssets: Map<string, MediaAsset>;

  constructor() {
    this.users = new Map();
    this.weeklyContent = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.mediaAssets = new Map();

    defaultWeeklyContent.forEach((content) => {
      const id = randomUUID();
      this.weeklyContent.set(content.weekNumber, { ...content, id });
    });

    this.academyOverview = {
      id: randomUUID(),
      title: "일단만들어",
      description:
        "복잡한 기능 없이 '수업 수강'과 '과제 공유'에만 집중하는 직관적인 학습 플랫폼입니다. AI와 함께 아이디어를 현실로 만들어보세요.",
      imageUrl: "",
    };

    const adminId = randomUUID();
    this.users.set(adminId, {
      id: adminId,
      email: "admin@justmakeit.com",
      password: "admin123",
      nickname: "관리자",
      role: "admin",
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      role: "student",
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async deleteUser(id: string): Promise<void> {
    this.users.delete(id);
  }

  async getWeeklyContent(weekNumber: number): Promise<WeeklyContent | undefined> {
    return this.weeklyContent.get(weekNumber);
  }

  async getAllWeeklyContent(): Promise<WeeklyContent[]> {
    return Array.from(this.weeklyContent.values()).sort((a, b) => a.weekNumber - b.weekNumber);
  }

  async updateWeeklyContent(
    weekNumber: number,
    content: UpdateWeeklyContent
  ): Promise<WeeklyContent | undefined> {
    const existing = this.weeklyContent.get(weekNumber);
    if (!existing) return undefined;

    const updated: WeeklyContent = {
      ...existing,
      ...content,
    };
    this.weeklyContent.set(weekNumber, updated);
    return updated;
  }

  async getAcademyOverview(): Promise<AcademyOverview> {
    return this.academyOverview;
  }

  async updateAcademyOverview(data: UpdateAcademyOverview): Promise<AcademyOverview> {
    this.academyOverview = {
      ...this.academyOverview,
      ...data,
    };
    return this.academyOverview;
  }

  async createPost(authorId: string, authorNickname: string, post: InsertPost): Promise<Post> {
    const id = randomUUID();
    const newPost: Post = {
      id,
      weekNumber: post.weekNumber,
      title: post.title,
      content: post.content,
      authorId,
      authorNickname,
      createdAt: new Date().toISOString(),
      isNotice: post.isNotice || false,
    };
    this.posts.set(id, newPost);
    return newPost;
  }

  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostsByWeek(weekNumber: number): Promise<Post[]> {
    const posts = Array.from(this.posts.values())
      .filter((post) => post.weekNumber === weekNumber);
    return posts.sort((a, b) => {
      if (a.isNotice && !b.isNotice) return -1;
      if (!a.isNotice && b.isNotice) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updatePost(id: string, data: { title: string; content: string }): Promise<Post | undefined> {
    const existing = this.posts.get(id);
    if (!existing) return undefined;

    const updated: Post = {
      ...existing,
      title: data.title,
      content: data.content,
    };
    this.posts.set(id, updated);
    return updated;
  }

  async deletePost(id: string): Promise<void> {
    this.posts.delete(id);
    const commentsToDelete = Array.from(this.comments.entries())
      .filter(([, comment]) => comment.postId === id)
      .map(([commentId]) => commentId);
    commentsToDelete.forEach((commentId) => this.comments.delete(commentId));
  }

  async getUserPostsByWeek(userId: string, weekNumber: number): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(
      (post) => post.authorId === userId && post.weekNumber === weekNumber
    );
  }

  async createComment(authorId: string, authorNickname: string, comment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const newComment: Comment = {
      id,
      postId: comment.postId,
      authorId,
      authorNickname,
      content: comment.content,
      createdAt: new Date().toISOString(),
    };
    this.comments.set(id, newComment);
    return newComment;
  }

  async getComment(id: string): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async getCommentsByPost(postId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((comment) => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async deleteComment(id: string): Promise<void> {
    this.comments.delete(id);
  }

  async createMediaAsset(filename: string, mimeType: string, data: string): Promise<MediaAsset> {
    const id = randomUUID();
    const asset: MediaAsset = {
      id,
      filename,
      mimeType,
      data,
      createdAt: new Date().toISOString(),
    };
    this.mediaAssets.set(id, asset);
    return asset;
  }

  async getMediaAsset(id: string): Promise<MediaAsset | undefined> {
    return this.mediaAssets.get(id);
  }
}

export const storage = new MemStorage();
