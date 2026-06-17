import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { ReflectionEditor } from "@/components/app/reflection-editor";
import { PageHeader } from "@/components/app/page-header";
import { Topbar } from "@/components/layout/topbar";
import { apiServer } from "@/lib/api-server";
import type { JournalEntry } from "@/lib/types";

export default async function ReflectPage() {
  const day = format(new Date(), "yyyy-MM-dd");
  const entry = await apiServer<JournalEntry>(`/reflections/${day}`);

  return (
    <>
      <Topbar title="Journal" />
      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8 sm:py-10 max-w-4xl w-full mx-auto">
        <PageHeader
          title="Journal"
          description="Review today, adjust tomorrow."
        />
        <Card className="p-6">
          <CardContent className="p-0">
            <ReflectionEditor initialEntry={entry} />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
