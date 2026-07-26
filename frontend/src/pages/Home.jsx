import Navbar from "../components/Navbar";
import BetaBanner from "../components/BetaBanner";
import Hero from "../components/Hero";
import Problems from "../components/Problems";
import Solutions from "../components/Solutions";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Navbar />
      <BetaBanner />
      <Hero />
      <Problems />
      <Solutions />
      <Footer />
    </>
  );
}

export default Home;