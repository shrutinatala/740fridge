import { PasswordGate } from "@/components/password-gate";

export default function GatedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <PasswordGate>{children}</PasswordGate>;
}
