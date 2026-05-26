import { BarChart3, ChevronDown, ChevronRight } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";

const reviewDays = [
  { day: "26", label: "Today", me: 5, hashim: 8 },
  { day: "25", label: "Sunday", me: 8, hashim: 9, warm: true },
  { day: "24", label: "Saturday", me: 9, hashim: 10 },
  { day: "25", label: "Sunday", me: 8, hashim: 9, warm: true },
  { day: "24", label: "Saturday", me: 9, hashim: 10 },
  { day: "23", label: "Friday", me: 6, hashim: 8, meWarm: true },
  { day: "22", label: "Thursday", me: 10, hashim: 7, hashimWarm: true },
  { day: "21", label: "Wednesday", me: 7, hashim: 9, meWarm: true },
];

function ProgressLine({ name, value, warm }: { name: string; value: number; warm?: boolean }) {
  return (
    <div className="grid grid-cols-[28px_1fr_40px] items-center gap-2">
      <div className="flex items-center">
        <UserAvatar name={name} tone="plain" size="sm" className={name === "Hashim" ? "bg-[#334534]" : "bg-[#30384b]"} />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-12 text-sm font-medium text-zinc-300 min-[390px]:w-14 min-[390px]:text-base">{name}</span>
        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-700/40">
          <div
            className={warm ? "h-full rounded-full bg-[#e8d2b8]" : "h-full rounded-full bg-[#bdd7b8]"}
            style={{ width: `${Math.round((value / 14) * 100)}%` }}
          />
        </div>
      </div>
      <span className="text-right text-sm font-medium text-zinc-200">{value}/14</span>
    </div>
  );
}

function ReviewDayCard({ day }: { day: (typeof reviewDays)[number] }) {
  return (
    <div className="grid grid-cols-[56px_1fr_18px] items-center rounded-[17px] border border-white/10 bg-[#111722]/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] min-[390px]:grid-cols-[62px_1fr_20px]">
      <div className="flex min-h-[72px] flex-col justify-center border-r border-white/8 px-3">
        <p className="text-3xl font-semibold leading-none text-white">{day.day}</p>
        <p className={day.label === "Today" ? "mt-1.5 text-sm font-medium text-[#bedab6]" : "mt-1.5 text-sm font-medium text-zinc-500"}>
          {day.label}
        </p>
      </div>
      <div className="space-y-2 px-3 py-3">
        <ProgressLine name="Me" value={day.me} warm={day.meWarm} />
        <ProgressLine name="Hashim" value={day.hashim} warm={day.warm || day.hashimWarm} />
      </div>
      <ChevronRight className="h-5 w-5 text-zinc-500" strokeWidth={2.5} aria-hidden="true" />
    </div>
  );
}

export function ReviewScreen() {
  return (
    <div className="space-y-4 pt-1">
      <header className="flex items-start justify-between gap-3">
        <h1 className="pt-3 text-3xl font-semibold leading-none tracking-tight text-white min-[390px]:text-4xl">Review</h1>
        <div className="text-right">
          <button
            type="button"
            className="flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-[#111722]/82 px-3 text-base font-semibold text-zinc-100 min-[390px]:min-h-11"
          >
            May 2025
            <ChevronDown className="h-4 w-4 text-zinc-400" strokeWidth={2.5} aria-hidden="true" />
          </button>
          <p className="mt-1.5 pr-1 text-xs font-medium text-zinc-600 min-[390px]:text-sm">Dhul-Hijjah 1446</p>
        </div>
      </header>

      <section className="rounded-[18px] border border-white/10 bg-[#111722]/82 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
        <div className="mb-3 flex items-center gap-2 text-zinc-500">
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
          <p className="text-sm font-medium min-[390px]:text-base">This month</p>
        </div>

        <div className="grid grid-cols-[1fr_1px_1fr] gap-3">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <UserAvatar name="Me" tone="plain" size="md" className="bg-[#30384b]" />
              <p className="text-lg font-semibold text-white min-[390px]:text-xl">Me</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-lg font-semibold text-[#bedab6] min-[390px]:text-xl">
                  186<span className="text-zinc-500">/434</span>
                </p>
                <p className="text-xs text-zinc-500 min-[390px]:text-sm">Done</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-[#d59699] min-[390px]:text-xl">248</p>
                <p className="text-xs text-zinc-500 min-[390px]:text-sm">Missed</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10" />

          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <UserAvatar name="Hashim" tone="plain" size="md" className="bg-[#334534]" />
              <p className="text-lg font-semibold text-white min-[390px]:text-xl">Hashim</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-lg font-semibold text-[#bedab6] min-[390px]:text-xl">
                  214<span className="text-zinc-500">/434</span>
                </p>
                <p className="text-xs text-zinc-500 min-[390px]:text-sm">Done</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-[#d59699] min-[390px]:text-xl">220</p>
                <p className="text-xs text-zinc-500 min-[390px]:text-sm">Missed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2.5">
        {reviewDays.map((day, index) => (
          <ReviewDayCard key={`${day.day}-${day.label}-${index}`} day={day} />
        ))}
      </section>
    </div>
  );
}
