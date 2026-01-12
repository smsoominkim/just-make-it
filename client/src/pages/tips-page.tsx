import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PenSquare, User, Calendar, Lightbulb } from "lucide-react";
import { TipsEditor } from "@/components/tips-editor";
import type { Post } from "@shared/schema";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function TipsPage() {
  const [editorOpen, setEditorOpen] = useState(false);

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts", 6],
  });

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-6 md:p-8 mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-tips-title">
                팁 모음
              </h1>
              <p className="text-muted-foreground">유용한 팁을 공유해보세요</p>
            </div>
          </div>
          <Dialog open={editorOpen} onOpenChange={(open) => {
            setEditorOpen(open);
            if (!open) {
              document.body.style.overflow = '';
              document.body.style.pointerEvents = '';
            }
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-write-tip">
                <PenSquare className="h-4 w-4 mr-2" />
                팁 작성하기
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>팁 작성</DialogTitle>
              </DialogHeader>
              <TipsEditor onSuccess={() => {
                setEditorOpen(false);
                document.body.style.overflow = '';
                document.body.style.pointerEvents = '';
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
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
                data-testid={`card-tip-${post.id}`}
              >
                <Card className="h-full hover-elevate transition-all duration-200 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2" data-testid={`text-tip-title-${post.id}`}>
                        {post.title}
                      </CardTitle>
                      <Badge variant="secondary" className="shrink-0">
                        <Lightbulb className="h-3 w-3 mr-1" />
                        팁
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {post.content.substring(0, 150)}...
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span data-testid={`text-tip-author-${post.id}`}>{post.authorNickname}</span>
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
              <Lightbulb className="h-12 w-12 mx-auto opacity-50" />
              <p className="text-lg font-medium">아직 작성된 팁이 없습니다</p>
              <p className="text-sm">첫 번째 팁을 공유해보세요!</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
