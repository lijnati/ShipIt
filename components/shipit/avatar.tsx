import Image from "next/image";
import { cn } from "@/lib/utils";

type AvatarProps = {
  username: string;
  avatarUrl: string | null;
  /** Rendered size in px. */
  size?: number;
  className?: string;
};

/** Square, bordered avatar. Falls back to the username's first letter. */
export function Avatar({ username, avatarUrl, size = 28, className }: AvatarProps) {
  const box = cn(
    "shrink-0 border-2 border-foreground",
    className,
  );

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={size}
        height={size}
        className={cn(box, "bg-secondary object-cover")}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(box, "grid place-items-center bg-brand font-mono font-bold uppercase")}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {username.charAt(0)}
    </span>
  );
}
