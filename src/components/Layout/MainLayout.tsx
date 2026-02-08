import MobileBottomBar from "@/components/Layout/MobileBottomBar";
import NavBar from "@/components/Layout/NavBar";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import FooterBar from "./FooterBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <NavBar />
        <main>{children}</main>
        <MobileBottomBar />
        <FooterBar />
      </CartProvider>
    </AuthProvider>
  );
}
