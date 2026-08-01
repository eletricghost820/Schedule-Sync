import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import {
  BELL_TIMES,
  PERIOD_LABEL,
  PERIOD_ORDER,
  STUDENTS,
  getStudent,
  isFree,
} from "@/data/schedule";
import { WednesdayNote } from "@/components/WednesdayNote";

export const Route = createFileRoute("/student/$studentId")({
  loader: ({ params }) => {
    const student = getStudent(params.studentId);
    if (!student) throw notFound();
    return { student };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Student not found — Schedule Sync" }, { name: "robots", content: "noindex" }],
      };
    }
    const t = `${loaderData.student.name}'s Schedule — Schedule Sync`;
    const d = `Full daily class schedule for ${loaderData.student.name}: periods, times, teachers, and rooms.`;
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
      ],
    };
  },
  component: StudentPage,
});

function StudentPage() {
  const { student } = Route.useLoaderData();

  return (
    <div className="space-y-4">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" /> All friends
      </Link>

      <header className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
          {student.initials}
        </span>
        <div>
          <h1 className="text-2xl font-bold leading-tight">{student.name}</h1>
          <p className="text-xs text-muted-foreground">Daily schedule · standard bell times</p>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-semibold">Period</th>
              <th className="px-3 py-2 font-semibold">Class</th>
            </tr>
          </thead>
          <tbody>
            {PERIOD_ORDER.map((p) => {
              const slot = student.slots[p];
              const freePeriod = p !== "HR" && isFree(slot);
              return (
                <tr key={p} className="border-t border-border align-top">
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="font-display font-bold">{PERIOD_LABEL[p]}</div>
                    <div className="text-[11px] text-muted-foreground">{BELL_TIMES[p]}</div>
                  </td>
                  <td className="px-3 py-3">
                    {slot ? (
                      <>
                        <div
                          className={
                            freePeriod
                              ? "font-semibold text-free-foreground"
                              : "font-semibold text-foreground"
                          }
                        >
                          {slot.className}
                          {slot.days ? (
                            <span className="ml-1 text-xs font-normal text-muted-foreground">
                              ({slot.days})
                            </span>
                          ) : null}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {slot.teacher} · {slot.room}
                        </div>
                        {slot.alt ? (
                          <div className="mt-1.5 border-l-2 border-partial-foreground/40 pl-2">
                            <div className="text-sm font-medium">
                              {slot.alt.className}
                              <span className="ml-1 text-xs font-normal text-muted-foreground">
                                ({slot.alt.days})
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {slot.alt.teacher} · {slot.alt.room}
                            </div>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <WednesdayNote />

      <div className="flex flex-wrap gap-2 pt-1">
        {STUDENTS.filter((s) => s.id !== student.id).map((s) => (
          <Link
            key={s.id}
            to="/student/$studentId"
            params={{ studentId: s.id }}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary"
          >
            {s.name}
          </Link>
        ))}
      </div>
    </div>
  );
}