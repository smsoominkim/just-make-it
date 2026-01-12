import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Save, Trash2, Settings, Users, FileText, BookOpen } from "lucide-react";
import type { WeeklyContent, User, Post, AcademyOverview } from "@shared/schema";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function AdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          관리자 페이지
        </h1>
        <p className="text-muted-foreground mt-2">
          아카데미 콘텐츠와 회원을 관리합니다
        </p>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <BookOpen className="h-4 w-4 mr-2" />
            개요
          </TabsTrigger>
          <TabsTrigger value="content" data-testid="tab-content">
            <FileText className="h-4 w-4 mr-2" />
            주차 콘텐츠
          </TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="h-4 w-4 mr-2" />
            회원 관리
          </TabsTrigger>
          <TabsTrigger value="posts" data-testid="tab-posts">
            <FileText className="h-4 w-4 mr-2" />
            게시글 관리
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewManagement />
        </TabsContent>

        <TabsContent value="content">
          <WeeklyContentManagement />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="posts">
          <PostManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const { data: overview, isLoading } = useQuery<AcademyOverview>({
    queryKey: ["/api/academy-overview"],
  });

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
    },
  });

  useState(() => {
    if (overview) {
      form.reset({
        title: overview.title,
        description: overview.description,
        imageUrl: overview.imageUrl || "",
      });
    }
  });

  const updateOverview = useMutation({
    mutationFn: async (data: { title: string; description: string; imageUrl: string }) => {
      const response = await apiRequest("PUT", "/api/academy-overview", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/academy-overview"] });
      toast({
        title: "저장 완료",
        description: "개요가 업데이트되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "저장 실패",
        description: error instanceof Error ? error.message : "저장에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: { title: string; description: string; imageUrl: string }) => {
    setIsSaving(true);
    try {
      await updateOverview.mutateAsync(data);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>아카데미 개요 관리</CardTitle>
        <CardDescription>메인 페이지에 표시되는 개요 정보를 수정합니다</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>타이틀</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="아카데미 타이틀"
                      defaultValue={overview?.title}
                      data-testid="input-overview-title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="아카데미 설명"
                      className="min-h-32"
                      defaultValue={overview?.description}
                      data-testid="textarea-overview-description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이미지 URL (선택)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      defaultValue={overview?.imageUrl}
                      data-testid="input-overview-image"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSaving} data-testid="button-save-overview">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function WeeklyContentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [savingWeek, setSavingWeek] = useState<number | null>(null);

  const { data: contents, isLoading } = useQuery<WeeklyContent[]>({
    queryKey: ["/api/admin/weekly-content"],
  });

  const updateContent = useMutation({
    mutationFn: async (data: { weekNumber: number; title: string; youtubeUrl: string; materialsUrl: string; assignment: string }) => {
      const response = await apiRequest("PUT", `/api/admin/weekly-content/${data.weekNumber}`, data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/weekly-content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-content", variables.weekNumber] });
      toast({
        title: "저장 완료",
        description: `${variables.weekNumber}주차 콘텐츠가 업데이트되었습니다.`,
      });
    },
    onError: (error) => {
      toast({
        title: "저장 실패",
        description: error instanceof Error ? error.message : "저장에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  const handleSave = async (weekNumber: number, formData: FormData) => {
    setSavingWeek(weekNumber);
    try {
      await updateContent.mutateAsync({
        weekNumber,
        title: formData.get("title") as string,
        youtubeUrl: formData.get("youtubeUrl") as string,
        materialsUrl: formData.get("materialsUrl") as string,
        assignment: formData.get("assignment") as string,
      });
    } finally {
      setSavingWeek(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {contents?.map((content) => (
        <Card key={content.weekNumber}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">{content.weekNumber}주차</Badge>
              콘텐츠 관리
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave(content.weekNumber, new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">주제</label>
                  <Input
                    name="title"
                    defaultValue={content.title}
                    data-testid={`input-week-${content.weekNumber}-title`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">유튜브 URL</label>
                  <Input
                    name="youtubeUrl"
                    defaultValue={content.youtubeUrl}
                    data-testid={`input-week-${content.weekNumber}-youtube`}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">자료 링크 URL</label>
                <Input
                  name="materialsUrl"
                  defaultValue={content.materialsUrl}
                  data-testid={`input-week-${content.weekNumber}-materials`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">이번 주 과제</label>
                <Input
                  name="assignment"
                  defaultValue={content.assignment}
                  data-testid={`input-week-${content.weekNumber}-assignment`}
                />
              </div>
              <Button
                type="submit"
                disabled={savingWeek === content.weekNumber}
                data-testid={`button-save-week-${content.weekNumber}`}
              >
                {savingWeek === content.weekNumber ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    저장
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "삭제 완료",
        description: "회원이 삭제되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "삭제 실패",
        description: error instanceof Error ? error.message : "삭제에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>회원 관리</CardTitle>
        <CardDescription>총 {users?.length || 0}명의 회원</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>닉네임</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>역할</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                <TableCell className="font-medium">{user.nickname}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role === "admin" ? "관리자" : "수강생"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {user.role !== "admin" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-delete-user-${user.id}`}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>회원 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            {user.nickname} 회원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteUser.mutate(user.id)}>
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PostManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/admin/posts"],
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/posts/${postId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      toast({
        title: "삭제 완료",
        description: "게시글이 삭제되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "삭제 실패",
        description: error instanceof Error ? error.message : "삭제에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>게시글 관리</CardTitle>
        <CardDescription>총 {posts?.length || 0}개의 게시글</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>주차</TableHead>
              <TableHead>제목</TableHead>
              <TableHead>작성자</TableHead>
              <TableHead>작성일</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts?.map((post) => (
              <TableRow key={post.id} data-testid={`row-post-${post.id}`}>
                <TableCell>
                  <Badge variant="outline">{post.weekNumber}주차</Badge>
                </TableCell>
                <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                <TableCell>{post.authorNickname}</TableCell>
                <TableCell>
                  {format(new Date(post.createdAt), "M월 d일", { locale: ko })}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-delete-post-${post.id}`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>게시글 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                          "{post.title}" 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deletePost.mutate(post.id)}>
                          삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
