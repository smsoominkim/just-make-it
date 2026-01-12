import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import MDEditor from "@uiw/react-md-editor";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ImagePlus } from "lucide-react";

interface TipsEditorProps {
  onSuccess?: () => void;
}

const tipsSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
});

type TipsInput = z.infer<typeof tipsSchema>;

const tipsTemplate = `## 팁 제목

### 어떤 상황에서 유용한가요?
- 

### 팁 내용
- 

### 참고 링크 (선택)
- `;

export function TipsEditor({ onSuccess }: TipsEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [content, setContent] = useState(tipsTemplate);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TipsInput>({
    resolver: zodResolver(tipsSchema),
    defaultValues: {
      title: "",
      content: tipsTemplate,
    },
  });

  const createTip = useMutation({
    mutationFn: async (data: TipsInput) => {
      const response = await apiRequest("POST", "/api/posts", {
        weekNumber: 6,
        title: data.title,
        content: data.content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", 6] });
      toast({
        title: "팁 등록 완료",
        description: "팁이 성공적으로 등록되었습니다.",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "등록 실패",
        description: error instanceof Error ? error.message : "팁 등록에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "업로드 실패");
      }

      const result = await response.json();
      const imageMarkdown = `![${file.name}](${result.url})`;
      
      const newContent = content + "\n" + imageMarkdown + "\n";
      setContent(newContent);
      form.setValue("content", newContent);

      toast({
        title: "이미지 업로드 완료",
        description: "이미지가 추가되었습니다.",
      });
    } catch (error) {
      toast({
        title: "업로드 실패",
        description: error instanceof Error ? error.message : "이미지 업로드에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
      e.target.value = "";
    }
  };

  const onSubmit = async (data: TipsInput) => {
    setIsSubmitting(true);
    try {
      await createTip.mutateAsync({ ...data, content });
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
                  placeholder="팁 제목을 입력하세요"
                  className="h-12"
                  data-testid="input-tip-title"
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
          render={() => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>본문</FormLabel>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    data-testid="input-tip-image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    data-testid="button-tip-upload-image"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImagePlus className="h-4 w-4" />
                    )}
                    <span className="ml-2">이미지 업로드</span>
                  </Button>
                </div>
              </div>
              <FormControl>
                <div>
                  <div data-color-mode="light" className="dark:hidden">
                    <MDEditor
                      value={content}
                      onChange={(val) => {
                        setContent(val || "");
                        form.setValue("content", val || "");
                      }}
                      height={400}
                      preview="live"
                      data-testid="editor-tip-content"
                    />
                  </div>
                  <div data-color-mode="dark" className="hidden dark:block">
                    <MDEditor
                      value={content}
                      onChange={(val) => {
                        setContent(val || "");
                        form.setValue("content", val || "");
                      }}
                      height={400}
                      preview="live"
                      data-testid="editor-tip-content-dark"
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setContent(tipsTemplate);
              form.reset();
            }}
            data-testid="button-tip-reset"
          >
            초기화
          </Button>
          <Button type="submit" disabled={isSubmitting} data-testid="button-submit-tip">
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
