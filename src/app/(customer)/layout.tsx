import { Header } from "@/components/layout/header";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="container px-4 py-6">{children}</main>
    </>
  );
}
