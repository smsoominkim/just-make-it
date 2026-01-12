import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import multer from "multer";
import { storage } from "./storage";
import {
  insertUserSchema,
  loginSchema,
  insertPostSchema,
  insertCommentSchema,
  updateAcademyOverviewSchema,
  updateWeeklyContentSchema,
} from "@shared/schema";
import type { User } from "@shared/schema";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("이미지 파일만 업로드 가능합니다"));
    }
  },
});

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "로그인이 필요합니다" });
  }
  next();
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "로그인이 필요합니다" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "관리자 권한이 필요합니다" });
  }
  next();
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "just-make-it-secret-key-2024",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }

      const { email, password, nickname } = result.data;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "이미 사용 중인 이메일입니다" });
      }

      const user = await storage.createUser({ email, password, nickname });
      req.session.userId = user.id;

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "회원가입에 실패했습니다" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }

      const { email, password } = result.data;

      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다" });
      }

      req.session.userId = user.id;

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "로그인에 실패했습니다" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "로그아웃에 실패했습니다" });
      }
      res.json({ message: "로그아웃되었습니다" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "로그인이 필요합니다" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: "사용자를 찾을 수 없습니다" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  app.get("/api/academy-overview", async (req, res) => {
    const overview = await storage.getAcademyOverview();
    res.json(overview);
  });

  app.put("/api/academy-overview", requireAdmin, async (req, res) => {
    try {
      const result = updateAcademyOverviewSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }

      const updated = await storage.updateAcademyOverview(result.data);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "개요 업데이트에 실패했습니다" });
    }
  });

  app.get("/api/weekly-content/:weekNumber", async (req, res) => {
    const weekNumber = parseInt(req.params.weekNumber, 10);
    if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 5) {
      return res.status(400).json({ message: "유효하지 않은 주차입니다" });
    }

    const content = await storage.getWeeklyContent(weekNumber);
    if (!content) {
      return res.status(404).json({ message: "콘텐츠를 찾을 수 없습니다" });
    }

    res.json(content);
  });

  app.get("/api/admin/weekly-content", requireAdmin, async (req, res) => {
    const contents = await storage.getAllWeeklyContent();
    res.json(contents);
  });

  app.put("/api/admin/weekly-content/:weekNumber", requireAdmin, async (req, res) => {
    try {
      const weekNumber = parseInt(req.params.weekNumber, 10);
      if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 5) {
        return res.status(400).json({ message: "유효하지 않은 주차입니다" });
      }

      const result = updateWeeklyContentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }

      const updated = await storage.updateWeeklyContent(weekNumber, result.data);

      if (!updated) {
        return res.status(404).json({ message: "콘텐츠를 찾을 수 없습니다" });
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "콘텐츠 업데이트에 실패했습니다" });
    }
  });

  app.get("/api/posts/:weekNumber", async (req, res) => {
    const weekNumber = parseInt(req.params.weekNumber, 10);
    if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 6) {
      return res.status(400).json({ message: "유효하지 않은 주차입니다" });
    }

    const posts = await storage.getPostsByWeek(weekNumber);
    res.json(posts);
  });

  app.get("/api/posts/detail/:id", async (req, res) => {
    const post = await storage.getPost(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다" });
    }
    res.json(post);
  });

  app.post("/api/posts", requireAuth, async (req, res) => {
    try {
      const result = insertPostSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ message: "사용자를 찾을 수 없습니다" });
      }

      const postData = {
        ...result.data,
        isNotice: user.role === "admin" ? result.data.isNotice : false,
      };

      const post = await storage.createPost(user.id, user.nickname, postData);
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "게시글 작성에 실패했습니다" });
    }
  });

  app.get("/api/admin/posts", requireAdmin, async (req, res) => {
    const posts = await storage.getAllPosts();
    res.json(posts);
  });

  app.delete("/api/admin/posts/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deletePost(req.params.id);
      res.json({ message: "게시글이 삭제되었습니다" });
    } catch (error) {
      res.status(500).json({ message: "게시글 삭제에 실패했습니다" });
    }
  });

  app.get("/api/comments/:postId", async (req, res) => {
    const comments = await storage.getCommentsByPost(req.params.postId);
    res.json(comments);
  });

  app.post("/api/comments", requireAuth, async (req, res) => {
    try {
      const result = insertCommentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ message: "사용자를 찾을 수 없습니다" });
      }

      const comment = await storage.createComment(user.id, user.nickname, result.data);
      res.json(comment);
    } catch (error) {
      res.status(500).json({ message: "댓글 작성에 실패했습니다" });
    }
  });

  app.delete("/api/comments/:id", requireAuth, async (req, res) => {
    try {
      const comment = await storage.getComment(req.params.id);
      if (!comment) {
        return res.status(404).json({ message: "댓글을 찾을 수 없습니다" });
      }

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ message: "사용자를 찾을 수 없습니다" });
      }

      if (comment.authorId !== user.id && user.role !== "admin") {
        return res.status(403).json({ message: "댓글을 삭제할 권한이 없습니다" });
      }

      await storage.deleteComment(req.params.id);
      res.json({ message: "댓글이 삭제되었습니다" });
    } catch (error) {
      res.status(500).json({ message: "댓글 삭제에 실패했습니다" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (user?.role === "admin") {
        return res.status(400).json({ message: "관리자는 삭제할 수 없습니다" });
      }
      await storage.deleteUser(req.params.id);
      res.json({ message: "회원이 삭제되었습니다" });
    } catch (error) {
      res.status(500).json({ message: "회원 삭제에 실패했습니다" });
    }
  });

  app.post("/api/uploads", requireAuth, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "이미지 파일이 필요합니다" });
      }

      const base64Data = req.file.buffer.toString("base64");
      const asset = await storage.createMediaAsset(
        req.file.originalname,
        req.file.mimetype,
        base64Data
      );

      res.json({ id: asset.id, url: `/api/uploads/${asset.id}` });
    } catch (error) {
      res.status(500).json({ message: "이미지 업로드에 실패했습니다" });
    }
  });

  app.get("/api/uploads/:id", async (req, res) => {
    try {
      const asset = await storage.getMediaAsset(req.params.id);
      if (!asset) {
        return res.status(404).json({ message: "이미지를 찾을 수 없습니다" });
      }

      const buffer = Buffer.from(asset.data, "base64");
      res.set("Content-Type", asset.mimeType);
      res.set("Cache-Control", "public, max-age=31536000");
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ message: "이미지 조회에 실패했습니다" });
    }
  });

  return httpServer;
}
