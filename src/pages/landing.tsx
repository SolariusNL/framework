import Faq from "@/components/faq";
import Features from "@/components/features";
import Footer from "@/components/foot";
import Hero from "@/components/hero";
import LandingHeader from "@/components/landing-header";
import LargeFeatures from "@/components/large-features";
import LoveFromSolarius from "@/components/love-from-solarius";
import { NextPage } from "next";

const Landing: NextPage = () => {
  return (
    <>
      <LandingHeader />
      <Hero />
      <Features />
      <LargeFeatures />
      <Faq />
      <LoveFromSolarius />
      <Footer />
    </>
  );
};

export default Landing;
