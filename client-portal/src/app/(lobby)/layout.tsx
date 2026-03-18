import { ClientLayoutShell } from "@/src/components/layout/ClientLayoutShell";

export default function LobbyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayoutShell>{children}</ClientLayoutShell>;
}

