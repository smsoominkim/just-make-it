import { pool } from "./db";
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
import type { IStorage } from "./storage"; // ✅ type-only로 순환참조 방지

export class PostgresStorage implements IStorage {
    private seeded = false;

    private async ensureSeeded() {
        if (this.seeded) return;

        // ✅ admin 계정(없으면 생성)
        await pool.query(
            `
      insert into users (email, password, nickname, role)
      values ($1,$2,$3,'admin')
      on conflict (email) do nothing
      `,
            ["admin@justmakeit.com", "admin123", "관리자"],
        );

        // ✅ academy_overview가 비어있으면 1개 생성
        const ov = await pool.query(`select id from academy_overview limit 1`);
        if (ov.rowCount === 0) {
            await pool.query(
                `insert into academy_overview (title, description, image_url) values ($1,$2,$3)`,
                [
                    "일단만들어",
                    "복잡한 기능 없이 '수업 수강'과 '과제 공유'에만 집중하는 직관적인 학습 플랫폼입니다. AI와 함께 아이디어를 현실로 만들어보세요.",
                    "",
                ],
            );
        }

        // ✅ weekly_content가 비어있으면 기본 데이터 채우기
        const wc = await pool.query(`select id from weekly_content limit 1`);
        if (wc.rowCount === 0) {
            for (const item of defaultWeeklyContent) {
                await pool.query(
                    `insert into weekly_content
           (week_number, title, youtube_url, materials_url, learning_objectives, assignment)
           values ($1,$2,$3,$4,$5,$6)
           on conflict (week_number) do update set
             title=excluded.title,
             youtube_url=excluded.youtube_url,
             materials_url=excluded.materials_url,
             learning_objectives=excluded.learning_objectives,
             assignment=excluded.assignment
          `,
                    [
                        item.weekNumber,
                        item.title,
                        item.youtubeUrl ?? "",
                        item.materialsUrl ?? "",
                        item.learningObjectives ?? "",
                        item.assignment ?? "",
                    ],
                );
            }
        }

        this.seeded = true;
    }

    // ---------------- Users ----------------
    async getUser(id: string): Promise<User | undefined> {
        await this.ensureSeeded();
        const r = await pool.query(`select * from users where id=$1`, [id]);
        return r.rows[0] ?? undefined;
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        await this.ensureSeeded();
        const r = await pool.query(`select * from users where email=$1`, [email]);
        return r.rows[0] ?? undefined;
    }

    async createUser(user: InsertUser): Promise<User> {
        await this.ensureSeeded();
        const r = await pool.query(
            `insert into users (email,password,nickname,role)
       values ($1,$2,$3,'student')
       returning *`,
            [user.email, user.password, user.nickname],
        );
        return r.rows[0];
    }

    async getAllUsers(): Promise<User[]> {
        await this.ensureSeeded();
        const r = await pool.query(`select * from users order by created_at desc`);
        return r.rows;
    }

    async deleteUser(id: string): Promise<void> {
        await pool.query(`delete from users where id=$1`, [id]);
    }

    // ---------------- Weekly Content ----------------
    async getWeeklyContent(weekNumber: number): Promise<WeeklyContent | undefined> {
        await this.ensureSeeded();
        const r = await pool.query(
            `select id,
              week_number as "weekNumber",
              title,
              youtube_url as "youtubeUrl",
              materials_url as "materialsUrl",
              learning_objectives as "learningObjectives",
              assignment
       from weekly_content
       where week_number=$1`,
            [weekNumber],
        );
        return r.rows[0] ?? undefined;
    }

    async getAllWeeklyContent(): Promise<WeeklyContent[]> {
        await this.ensureSeeded();
        const r = await pool.query(
            `select id,
              week_number as "weekNumber",
              title,
              youtube_url as "youtubeUrl",
              materials_url as "materialsUrl",
              learning_objectives as "learningObjectives",
              assignment
       from weekly_content
       order by week_number asc`,
        );
        return r.rows;
    }

    async updateWeeklyContent(
        weekNumber: number,
        content: UpdateWeeklyContent,
    ): Promise<WeeklyContent | undefined> {
        await this.ensureSeeded();
        const r = await pool.query(
            `update weekly_content set
         title=$2,
         youtube_url=$3,
         materials_url=$4,
         learning_objectives=$5,
         assignment=$6
       where week_number=$1
       returning id,
                 week_number as "weekNumber",
                 title,
                 youtube_url as "youtubeUrl",
                 materials_url as "materialsUrl",
                 learning_objectives as "learningObjectives",
                 assignment`,
            [
                weekNumber,
                content.title,
                content.youtubeUrl ?? "",
                content.materialsUrl ?? "",
                content.learningObjectives ?? "",
                content.assignment ?? "",
            ],
        );
        return r.rows[0] ?? undefined;
    }

    // ---------------- Academy Overview ----------------
    async getAcademyOverview(): Promise<AcademyOverview> {
        await this.ensureSeeded();
        const r = await pool.query(
            `select id, title, description, image_url as "imageUrl"
       from academy_overview
       limit 1`,
        );
        return r.rows[0];
    }

    async updateAcademyOverview(data: UpdateAcademyOverview): Promise<AcademyOverview> {
        await this.ensureSeeded();
        const cur = await pool.query(`select id from academy_overview limit 1`);
        const id = cur.rows[0].id;

        const r = await pool.query(
            `update academy_overview set
        title=$2, description=$3, image_url=$4, updated_at=now()
       where id=$1
       returning id, title, description, image_url as "imageUrl"`,
            [id, data.title, data.description, data.imageUrl ?? ""],
        );
        return r.rows[0];
    }

    // ---------------- Posts ----------------
    async createPost(authorId: string, authorNickname: string, post: InsertPost): Promise<Post> {
        const r = await pool.query(
            `insert into posts (week_number,title,content,author_id,author_nickname,is_notice)
       values ($1,$2,$3,$4,$5,$6)
       returning id,
                 week_number as "weekNumber",
                 title,
                 content,
                 author_id as "authorId",
                 author_nickname as "authorNickname",
                 created_at as "createdAt",
                 is_notice as "isNotice"`,
            [post.weekNumber, post.title, post.content, authorId, authorNickname, post.isNotice ?? false],
        );
        return r.rows[0];
    }

    async getPost(id: string): Promise<Post | undefined> {
        const r = await pool.query(
            `select id,
              week_number as "weekNumber",
              title,
              content,
              author_id as "authorId",
              author_nickname as "authorNickname",
              created_at as "createdAt",
              is_notice as "isNotice"
       from posts where id=$1`,
            [id],
        );
        return r.rows[0] ?? undefined;
    }

    async getPostsByWeek(weekNumber: number): Promise<Post[]> {
        const r = await pool.query(
            `select id,
              week_number as "weekNumber",
              title,
              content,
              author_id as "authorId",
              author_nickname as "authorNickname",
              created_at as "createdAt",
              is_notice as "isNotice"
       from posts
       where week_number=$1
       order by is_notice desc, created_at desc`,
            [weekNumber],
        );
        return r.rows;
    }

    async getAllPosts(): Promise<Post[]> {
        const r = await pool.query(
            `select id,
              week_number as "weekNumber",
              title,
              content,
              author_id as "authorId",
              author_nickname as "authorNickname",
              created_at as "createdAt",
              is_notice as "isNotice"
       from posts
       order by created_at desc`,
        );
        return r.rows;
    }

    async updatePost(id: string, data: { title: string; content: string }): Promise<Post | undefined> {
        const r = await pool.query(
            `update posts set title=$2, content=$3
       where id=$1
       returning id,
                 week_number as "weekNumber",
                 title,
                 content,
                 author_id as "authorId",
                 author_nickname as "authorNickname",
                 created_at as "createdAt",
                 is_notice as "isNotice"`,
            [id, data.title, data.content],
        );
        return r.rows[0] ?? undefined;
    }

    async deletePost(id: string): Promise<void> {
        await pool.query(`delete from posts where id=$1`, [id]);
    }

    async getUserPostsByWeek(userId: string, weekNumber: number): Promise<Post[]> {
        const r = await pool.query(
            `select id,
              week_number as "weekNumber",
              title,
              content,
              author_id as "authorId",
              author_nickname as "authorNickname",
              created_at as "createdAt",
              is_notice as "isNotice"
       from posts
       where author_id=$1 and week_number=$2
       order by created_at desc`,
            [userId, weekNumber],
        );
        return r.rows;
    }

    // ---------------- Comments ----------------
    async createComment(
        authorId: string,
        authorNickname: string,
        comment: InsertComment,
    ): Promise<Comment> {
        const r = await pool.query(
            `insert into comments (post_id,author_id,author_nickname,content)
       values ($1,$2,$3,$4)
       returning id,
                 post_id as "postId",
                 author_id as "authorId",
                 author_nickname as "authorNickname",
                 content,
                 created_at as "createdAt"`,
            [comment.postId, authorId, authorNickname, comment.content],
        );
        return r.rows[0];
    }

    async getComment(id: string): Promise<Comment | undefined> {
        const r = await pool.query(
            `select id,
              post_id as "postId",
              author_id as "authorId",
              author_nickname as "authorNickname",
              content,
              created_at as "createdAt"
       from comments where id=$1`,
            [id],
        );
        return r.rows[0] ?? undefined;
    }

    async getCommentsByPost(postId: string): Promise<Comment[]> {
        const r = await pool.query(
            `select id,
              post_id as "postId",
              author_id as "authorId",
              author_nickname as "authorNickname",
              content,
              created_at as "createdAt"
       from comments
       where post_id=$1
       order by created_at asc`,
            [postId],
        );
        return r.rows;
    }

    async deleteComment(id: string): Promise<void> {
        await pool.query(`delete from comments where id=$1`, [id]);
    }

    // ---------------- Media Assets ----------------
    async createMediaAsset(filename: string, mimeType: string, data: string): Promise<MediaAsset> {
        const r = await pool.query(
            `insert into media_assets (filename,mime_type,data)
       values ($1,$2,$3)
       returning id,
                 filename,
                 mime_type as "mimeType",
                 data,
                 created_at as "createdAt"`,
            [filename, mimeType, data],
        );
        return r.rows[0];
    }

    async getMediaAsset(id: string): Promise<MediaAsset | undefined> {
        const r = await pool.query(
            `select id,
              filename,
              mime_type as "mimeType",
              data,
              created_at as "createdAt"
       from media_assets where id=$1`,
            [id],
        );
        return r.rows[0] ?? undefined;
    }
}
