import { eq, and, desc, asc } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  weeklyContent,
  academyOverview,
  posts,
  comments,
  mediaAssets,
  defaultWeeklyContent,
  type User,
  type InsertUser,
  type WeeklyContent,
  type UpdateWeeklyContent,
  type AcademyOverview,
  type UpdateAcademyOverview,
  type Post as DbPost,
  type InsertPost,
  type Comment as DbComment,
  type InsertComment,
  type MediaAsset as DbMediaAsset,
} from "@shared/schema";

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

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorNickname: string;
  content: string;
  createdAt: string;
}

export interface MediaAsset {
  id: string;
  filename: string;
  mimeType: string;
  data: string;
  createdAt: string;
}

function serializePost(post: DbPost): Post {
  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
  };
}

function serializeComment(comment: DbComment): Comment {
  return {
    ...comment,
    createdAt: comment.createdAt.toISOString(),
  };
}

function serializeMediaAsset(asset: DbMediaAsset): MediaAsset {
  return {
    ...asset,
    createdAt: asset.createdAt.toISOString(),
  };
}

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

  initializeDefaultData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: insertUser.email,
        password: insertUser.password,
        nickname: insertUser.nickname,
        role: "student",
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getWeeklyContent(weekNumber: number): Promise<WeeklyContent | undefined> {
    const [content] = await db.select().from(weeklyContent).where(eq(weeklyContent.weekNumber, weekNumber));
    return content || undefined;
  }

  async getAllWeeklyContent(): Promise<WeeklyContent[]> {
    return await db.select().from(weeklyContent).orderBy(asc(weeklyContent.weekNumber));
  }

  async updateWeeklyContent(weekNumber: number, content: UpdateWeeklyContent): Promise<WeeklyContent | undefined> {
    const [updated] = await db
      .update(weeklyContent)
      .set({
        title: content.title,
        youtubeUrl: content.youtubeUrl || "",
        materialsUrl: content.materialsUrl || "",
        learningObjectives: content.learningObjectives || "",
        assignment: content.assignment || "",
      })
      .where(eq(weeklyContent.weekNumber, weekNumber))
      .returning();
    return updated || undefined;
  }

  async getAcademyOverview(): Promise<AcademyOverview> {
    const [overview] = await db.select().from(academyOverview);
    if (!overview) {
      const [created] = await db
        .insert(academyOverview)
        .values({
          title: "일단만들어",
          description: "복잡한 기능 없이 '수업 수강'과 '과제 공유'에만 집중하는 직관적인 학습 플랫폼입니다. AI와 함께 아이디어를 현실로 만들어보세요.",
          imageUrl: "",
        })
        .returning();
      return created;
    }
    return overview;
  }

  async updateAcademyOverview(data: UpdateAcademyOverview): Promise<AcademyOverview> {
    const existing = await this.getAcademyOverview();
    const [updated] = await db
      .update(academyOverview)
      .set({
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl || "",
      })
      .where(eq(academyOverview.id, existing.id))
      .returning();
    return updated;
  }

  async createPost(authorId: string, authorNickname: string, post: InsertPost): Promise<Post> {
    const [newPost] = await db
      .insert(posts)
      .values({
        weekNumber: post.weekNumber,
        title: post.title,
        content: post.content,
        authorId,
        authorNickname,
        isNotice: post.isNotice || false,
      })
      .returning();
    return serializePost(newPost);
  }

  async getPost(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post ? serializePost(post) : undefined;
  }

  async getPostsByWeek(weekNumber: number): Promise<Post[]> {
    const allPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.weekNumber, weekNumber))
      .orderBy(desc(posts.isNotice), desc(posts.createdAt));
    return allPosts.map(serializePost);
  }

  async getAllPosts(): Promise<Post[]> {
    const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));
    return allPosts.map(serializePost);
  }

  async updatePost(id: string, data: { title: string; content: string }): Promise<Post | undefined> {
    const [updated] = await db
      .update(posts)
      .set({
        title: data.title,
        content: data.content,
      })
      .where(eq(posts.id, id))
      .returning();
    return updated ? serializePost(updated) : undefined;
  }

  async deletePost(id: string): Promise<void> {
    await db.delete(comments).where(eq(comments.postId, id));
    await db.delete(posts).where(eq(posts.id, id));
  }

  async getUserPostsByWeek(userId: string, weekNumber: number): Promise<Post[]> {
    const userPosts = await db
      .select()
      .from(posts)
      .where(and(eq(posts.authorId, userId), eq(posts.weekNumber, weekNumber)));
    return userPosts.map(serializePost);
  }

  async createComment(authorId: string, authorNickname: string, comment: InsertComment): Promise<Comment> {
    const [newComment] = await db
      .insert(comments)
      .values({
        postId: comment.postId,
        authorId,
        authorNickname,
        content: comment.content,
      })
      .returning();
    return serializeComment(newComment);
  }

  async getComment(id: string): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment ? serializeComment(comment) : undefined;
  }

  async getCommentsByPost(postId: string): Promise<Comment[]> {
    const allComments = await db.select().from(comments).where(eq(comments.postId, postId)).orderBy(asc(comments.createdAt));
    return allComments.map(serializeComment);
  }

  async deleteComment(id: string): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  async createMediaAsset(filename: string, mimeType: string, data: string): Promise<MediaAsset> {
    const [asset] = await db
      .insert(mediaAssets)
      .values({
        filename,
        mimeType,
        data,
      })
      .returning();
    return serializeMediaAsset(asset);
  }

  async getMediaAsset(id: string): Promise<MediaAsset | undefined> {
    const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id));
    return asset ? serializeMediaAsset(asset) : undefined;
  }

  async initializeDefaultData(): Promise<void> {
    const existingAdmin = await this.getUserByEmail("admin@justmakeit.com");
    if (!existingAdmin) {
      await db.insert(users).values({
        email: "admin@justmakeit.com",
        password: "admin123",
        nickname: "관리자",
        role: "admin",
      });
    }

    const existingContent = await this.getAllWeeklyContent();
    if (existingContent.length === 0) {
      for (const content of defaultWeeklyContent) {
        await db.insert(weeklyContent).values(content);
      }
    }

    await this.getAcademyOverview();
  }
}

export const storage = new DatabaseStorage();
