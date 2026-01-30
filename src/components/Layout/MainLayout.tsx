import MobileBottomBar from "@/components/Layout/MobileBottomBar";
import NavBar from "@/components/Layout/NavBar";
import FooterBar from "./FooterBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
      <MobileBottomBar />
      <FooterBar/>
    </>
  );
}
