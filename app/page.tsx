import { NavBar } from "@/components/Header";
import HeroSection from "@/components/Hero";


export default function Home() {
  return (
    <div className="bg-gradient-to-b from-black to-green-900">
      <NavBar />
      <div className="flex flex-col items-center justify-between pb-[4rem]">
        <HeroSection/>
      </div>
    </div>
  );
}
