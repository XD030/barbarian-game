import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "蠻族迷宮生存",
  description: "以《게임 속 바바리안으로 살아남기》世界觀為基礎的同人迷宮生存遊戲",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant" className={notoSansTC.variable}>
      <body>{children}</body>
    </html>
  );
}
