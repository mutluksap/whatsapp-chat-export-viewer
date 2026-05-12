import { colorFromName, initials } from "@/lib/format";

type AvatarProps = {
  name: string;
  size?: number;
};

export default function Avatar({ name, size = 40 }: AvatarProps) {
  const bg = colorFromName(name);
  const init = initials(name);
  return (
    <div
      className="flex items-center justify-center text-white font-medium rounded-full shrink-0 select-none"
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        fontSize: size * 0.4,
      }}
      aria-hidden
    >
      {init}
    </div>
  );
}
