import { User } from "lucide-react";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name: string;
  tone?: "me" | "hashim" | "plain";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClass = {
  sm: "h-7 w-7",
  md: "h-10 w-10 min-[390px]:h-11 min-[390px]:w-11",
  lg: "h-14 w-14 min-[390px]:h-[60px] min-[390px]:w-[60px]",
};

const iconSizeClass = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

const toneClass = {
  me: "bg-[radial-gradient(circle_at_45%_22%,#f7f0de_0_18%,#5c4538_19%_35%,#153d38_36%_70%,#071018_71%)]",
  hashim: "bg-[radial-gradient(circle_at_50%_28%,#d8b084_0_15%,#2d201b_16%_32%,#113c35_33%_72%,#061018_73%)]",
  plain: "bg-zinc-700/60",
};

export function UserAvatar({ name, tone = "plain", size = "md", className }: UserAvatarProps) {
  const showIcon = tone === "plain";

  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]",
        sizeClass[size],
        toneClass[tone],
        className,
      )}
      aria-label={`${name} avatar`}
    >
      {showIcon ? <User className={cn("text-zinc-300", iconSizeClass[size])} aria-hidden="true" /> : null}
    </div>
  );
}
