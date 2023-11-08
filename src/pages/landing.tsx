import Footer from "@/components/foot";
import Hero from "@/components/hero";
import LandingHeader from "@/components/landing-header";
import { NextPage } from "next";

const Landing: NextPage = () => {
  return (
    <>
      <LandingHeader />
      <Hero />
      <Footer />
    </>
  );
};

export default Landing;
