import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertPostSchema, type InsertPost, postTemplate } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface PostEditorProps {
  weekNumber: number;
  onSuccess?: () => void;
}

export function PostEditor({ weekNumber, onSuccess }: PostEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InsertPost>({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      weekNumber,
      title: "",
      content: postTemplate,
    },
  });

  const createPost = useMutation({
    mutationFn: async (data: InsertPost) => {
      const response = await apiRequest("POST", "/api/posts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", weekNumber] });
      toast({
        title: "과제 등록 완료",
        description: "과제가 성공적으로 등록되었습니다.",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "등록 실패",
        description: error instanceof Error ? error.message : "과제 등록에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: InsertPost) => {
    setIsSubmitting(true);
    try {
      await createPost.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input
                  placeholder="과제 제목을 입력하세요"
                  className="h-12"
                  data-testid="input-post-title"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>내용</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="과제 내용을 입력하세요"
                  className="min-h-[400px] resize-y font-mono text-sm leading-relaxed"
                  data-testid="textarea-post-content"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            data-testid="button-reset"
          >
            초기화
          </Button>
          <Button type="submit" disabled={isSubmitting} data-testid="button-submit-post">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                게시 중...
              </>
            ) : (
              "게시"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
