import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, BookOpen, Users, Rocket, Code2, ChevronRight } from "lucide-react";
import type { AcademyOverview } from "@shared/schema";

export default function AcademyOverviewPage() {
  const { data: overview, isLoading } = useQuery<AcademyOverview>({
    queryKey: ["/api/academy-overview"],
  });

  const features = [
    {
      icon: BookOpen,
      title: "체계적인 커리큘럼",
      description: "5주간의 집중 학습으로 AI 네이티브 개발을 마스터합니다",
    },
    {
      icon: Code2,
      title: "실전 프로젝트",
      description: "매주 직접 프로젝트를 만들고 배포하며 실력을 쌓습니다",
    },
    {
      icon: Users,
      title: "커뮤니티 학습",
      description: "동료 수강생들과 과제를 공유하고 피드백을 주고받습니다",
    },
    {
      icon: Rocket,
      title: "바이브 코딩",
      description: "AI와 함께 빠르고 효율적으로 아이디어를 실현합니다",
    },
  ];

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 md:p-12 mb-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            태재 AI 바이브 코딩 아카데미
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold" data-testid="text-overview-title">
            {overview?.title || "일단만들어"}
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-overview-description">
            {overview?.description ||
              "복잡한 기능 없이 '수업 수강'과 '과제 공유'에만 집중하는 직관적인 학습 플랫폼입니다. AI와 함께 아이디어를 현실로 만들어보세요."}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">프로그램 특징</h2>
          <p className="text-muted-foreground">왜 일단만들어인가요?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="hover-elevate transition-all duration-200"
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-16 space-y-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">주차별 커리큘럼</h2>
          <p className="text-muted-foreground">5주 동안의 학습 여정</p>
        </div>

        <div className="grid gap-4">
          {[
            { week: 1, title: "AI-Native Creation", subtitle: "웹 서비스 기획부터 배포까지" },
            { week: 2, title: "Mobile App Expansion", subtitle: "내 서비스를 앱으로 확장" },
            { week: 3, title: "Market Ready", subtitle: "실전 같은 오류 해결과 마케팅" },
            { week: 4, title: "Agentic AI Workflow", subtitle: "스스로 일하는 AI 만들기" },
            { week: 5, title: "High-End UX & Control", subtitle: "프로덕트 완성도 높이기" },
          ].map((item) => (
            <Link key={item.week} href={`/week/${item.week}`}>
              <Card
                className="hover-elevate transition-all duration-200 cursor-pointer"
                data-testid={`link-week-${item.week}`}
              >
                <CardContent className="p-6 flex items-center gap-6">
                  <div className="w-14 h-14 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                    {item.week}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
