import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, MessageCircle, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { insertCommentSchema, type InsertComment, type Post, type Comment } from "@shared/schema";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const postId = params.id || "";
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: post, isLoading: isLoadingPost } = useQuery<Post>({
    queryKey: ["/api/posts/detail", postId],
  });

  const { data: comments, isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: ["/api/comments", postId],
  });

  const form = useForm<InsertComment>({
    resolver: zodResolver(insertCommentSchema),
    defaultValues: {
      postId,
      content: "",
    },
  });

  const createComment = useMutation({
    mutationFn: async (data: InsertComment) => {
      const response = await apiRequest("POST", "/api/comments", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", postId] });
      form.reset({ postId, content: "" });
      toast({
        title: "댓글 등록 완료",
        description: "댓글이 성공적으로 등록되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "등록 실패",
        description: error instanceof Error ? error.message : "댓글 등록에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await apiRequest("DELETE", `/api/comments/${commentId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", postId] });
      toast({
        title: "댓글 삭제 완료",
        description: "댓글이 삭제되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "삭제 실패",
        description: error instanceof Error ? error.message : "댓글 삭제에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: InsertComment) => {
    setIsSubmitting(true);
    try {
      await createComment.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPost) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 text-center">
        <p className="text-muted-foreground">게시글을 찾을 수 없습니다</p>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/")}>
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <Link href={`/week/${post.weekNumber}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6" data-testid="link-back">
        <ArrowLeft className="h-4 w-4" />
        <span>{post.weekNumber}주차 과제 목록으로</span>
      </Link>

      <Card className="mb-8">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <Badge variant="secondary">{post.weekNumber}주차</Badge>
          </div>
          <CardTitle className="text-2xl md:text-3xl" data-testid="text-post-title">
            {post.title}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {post.authorNickname.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span data-testid="text-post-author">{post.authorNickname}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(post.createdAt), "yyyy년 M월 d일 HH:mm", { locale: ko })}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-neutral dark:prose-invert max-w-none" data-testid="text-post-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h2 className="text-xl font-semibold">댓글 {comments?.length || 0}개</h2>
        </div>

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="댓글을 작성하세요..."
                      className="min-h-24 resize-y"
                      data-testid="textarea-comment"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} data-testid="button-submit-comment">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    등록 중...
                  </>
                ) : (
                  "댓글 등록"
                )}
              </Button>
            </div>
          </form>
        </Form>

        <div className="space-y-4">
          {isLoadingComments ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : comments && comments.length > 0 ? (
            comments.map((comment) => (
              <Card key={comment.id} className="p-4" data-testid={`card-comment-${comment.id}`}>
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {comment.authorNickname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm" data-testid={`text-comment-author-${comment.id}`}>
                          {comment.authorNickname}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.createdAt), "M월 d일 HH:mm", { locale: ko })}
                        </span>
                      </div>
                      {(user?.id === comment.authorId || user?.role === "admin") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => deleteComment.mutate(comment.id)}
                          data-testid={`button-delete-comment-${comment.id}`}
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap" data-testid={`text-comment-content-${comment.id}`}>
                      {comment.content}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>아직 댓글이 없습니다</p>
              <p className="text-sm">첫 번째 댓글을 남겨보세요!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
