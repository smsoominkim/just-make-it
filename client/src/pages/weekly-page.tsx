import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExternalLink, Download, CheckCircle2, Circle, PenSquare, User, Calendar, Target, Megaphone } from "lucide-react";
import { PostEditor } from "@/components/post-editor";
import type { WeeklyContent, Post } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function WeeklyPage() {
  const params = useParams<{ week: string }>();
  const weekNumber = parseInt(params.week || "1", 10);
  const { user } = useAuth();
  const [editorOpen, setEditorOpen] = useState(false);

  const { data: weeklyContent, isLoading: isLoadingContent } = useQuery<WeeklyContent>({
    queryKey: ["/api/weekly-content", weekNumber],
  });

  const { data: posts, isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: ["/api/posts", weekNumber],
  });

  const userHasPost = posts?.some((post) => post.authorId === user?.id);
  const progress = userHasPost ? 100 : 0;

  const getYoutubeEmbedUrl = (url: string) => {
    if (url.includes("embed")) return url;
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  if (isLoadingContent) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="space-y-8">
          <Skeleton className="h-12 w-96" />
          <Skeleton className="aspect-video w-full max-w-4xl" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl p-6 md:p-8 mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-week-title">
              {weekNumber}주차: {weeklyContent?.title || "주차 내용"}
            </h1>
          </div>
          <Badge
            variant={progress === 100 ? "default" : "secondary"}
            className="self-start md:self-auto text-sm px-4 py-2"
            data-testid="badge-progress"
          >
            {progress === 100 ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                완료 100%
              </>
            ) : (
              <>
                <Circle className="h-4 w-4 mr-2" />
                진행률 {progress}%
              </>
            )}
          </Badge>
        </div>

        <div className="space-y-6">
          <div className="aspect-video w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-black">
            {weeklyContent?.youtubeUrl ? (
              <iframe
                src={getYoutubeEmbedUrl(weeklyContent.youtubeUrl)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`${weekNumber}주차 강의 영상`}
                data-testid="video-player"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                영상이 준비 중입니다
              </div>
            )}
          </div>

          {weeklyContent?.materialsUrl && (
            <div className="flex justify-center">
              <Button asChild size="lg" data-testid="button-download-materials">
                <a
                  href={weeklyContent.materialsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-5 w-5 mr-2" />
                  강의자료 다운로드
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
          )}

          <div className="space-y-4 px-2 md:px-4">
            {weeklyContent?.learningObjectives && (
              <Card className="border-secondary/30 bg-secondary/10" data-testid="card-learning-objectives">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary-foreground" />
                    학습 목표
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-base whitespace-pre-line" data-testid="text-learning-objectives">
                    {weeklyContent.learningObjectives}
                  </div>
                </CardContent>
              </Card>
            )}

            {weeklyContent?.assignment && (
              <Card className="border-primary/20 bg-primary/5" data-testid="card-assignment">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    이번 주 과제
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base font-medium" data-testid="text-assignment">
                    {weeklyContent.assignment}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-semibold">수강생 과제</h2>
          <Dialog open={editorOpen} onOpenChange={(open) => {
            setEditorOpen(open);
            if (!open) {
              document.body.style.overflow = '';
              document.body.style.pointerEvents = '';
            }
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-write-post">
                <PenSquare className="h-4 w-4 mr-2" />
                글쓰기
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{weekNumber}주차 과제 작성</DialogTitle>
              </DialogHeader>
              <PostEditor weekNumber={weekNumber} onSuccess={() => {
                setEditorOpen(false);
                document.body.style.overflow = '';
                document.body.style.pointerEvents = '';
              }} />
            </DialogContent>
          </Dialog>
        </div>

        {isLoadingPosts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                data-testid={`card-post-${post.id}`}
              >
                <Card className={`h-full hover-elevate transition-all duration-200 cursor-pointer ${post.isNotice ? "border-primary bg-primary/5 ring-2 ring-primary/20" : ""}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2" data-testid={`text-post-title-${post.id}`}>
                        {post.title}
                      </CardTitle>
                      {post.isNotice && (
                        <Badge variant="default" className="shrink-0 bg-primary">
                          <Megaphone className="h-3 w-3 mr-1" />
                          공지
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {post.content.substring(0, 150)}...
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span data-testid={`text-post-author-${post.id}`}>{post.authorNickname}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(post.createdAt), "M월 d일", { locale: ko })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground space-y-2">
              <PenSquare className="h-12 w-12 mx-auto opacity-50" />
              <p className="text-lg font-medium">아직 작성된 과제가 없습니다</p>
              <p className="text-sm">첫 번째 과제를 작성해보세요!</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
