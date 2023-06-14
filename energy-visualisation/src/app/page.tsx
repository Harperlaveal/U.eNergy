import Image from "next/image";
import SplashPage from "./components/splash-page";

export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-between">
      <SplashPage></SplashPage>
    </main>
  );
}
