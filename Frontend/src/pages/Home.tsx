import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import FullScreenNav from "../components/FullScreenNav";
import AdminLoginModal from "../components/AdminLoginModal";

import { Canvas } from "@react-three/fiber";
import { Center, OrbitControls } from "@react-three/drei";

import OrbModel from "../models/OrbModel";

const Home = () => {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  return (
    <>
      <Navbar />
      <FullScreenNav />

      {/* Admin-only login gate modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      <main className="relative min-h-screen overflow-hidden bg-background text-text">

        {/* Background Glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[45%] h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[180px]" />
          <div className="absolute left-1/2 top-[55%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-tertiary/10 blur-[150px]" />
        </div>

        <section className="relative flex min-h-screen flex-col items-center pt-28">

          {/* Heading */}
          <div className="z-20 text-center">

            <span className="uppercase tracking-[0.7em] text-sm text-text-muted">
              Build
            </span>

            <h1 className="mt-4 text-6xl font-black uppercase leading-none md:text-8xl lg:text-[8rem]">
              THE{" "}
              <span className="text-primary">
                FUTURE
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-text-muted lg:text-lg">
              Crafting scalable digital products with thoughtful design,
              powerful engineering and modern AI technologies.
            </p>

            <div className="mt-10 flex justify-center gap-5">

              <Link to="/auth/signup" className="rounded-full bg-primary px-9 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-secondary cursor-pointer">
                Get Started
              </Link>

              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="rounded-full border border-primary px-9 py-4 font-semibold text-primary transition-all duration-300 hover:bg-primary hover:text-white cursor-pointer"
              >
                Open Admin Dashboard
              </button>

            </div>

          </div>

          {/* Orb */}
          <div className="relative -mt-8 h-[340px] w-[340px] md:h-[500px] md:w-[500px] lg:h-[620px] lg:w-[620px]">

            <Canvas
              camera={{
                position: [0, 0, 9],
                fov: 38,
              }}
              gl={{ alpha: true }}
              onCreated={({ scene }) => {
                scene.background = null;
              }}
            >
              <ambientLight intensity={1.3} />

              <pointLight
                position={[5, 5, 5]}
                intensity={4}
                color="#e91e63"
              />

              <pointLight
                position={[-5, -5, 5]}
                intensity={3}
                color="#5b21b6"
              />

              <directionalLight
                position={[2, 2, 2]}
                intensity={1}
              />

              <Center>
                <OrbModel />
              </Center>

              <OrbitControls
                autoRotate
                autoRotateSpeed={0.8}
                enablePan={false}
                enableZoom={false}
              />
            </Canvas>

          </div>

          {/* Footer */}
          <div className="-mt-6 flex flex-col items-center">

            <div className="uppercase tracking-[0.45em] text-xs text-text-muted lg:text-sm">
              AI • WEB • MOBILE • CLOUD
            </div>

            <div className="mt-10 flex flex-col items-center">

            </div>

          </div>

        </section>
      </main>
    </>
  );
};

export default Home;
