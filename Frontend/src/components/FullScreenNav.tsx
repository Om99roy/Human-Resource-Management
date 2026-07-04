import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { useContext, useEffect, useRef, useState } from "react";
import { NavbarContext } from "../context/NavContext";
import logo from "../assets/orBIS.png";
const FullScreenNav = () => {
  const fullNavLinksRef = useRef(null);
  const fullScreenRef = useRef(null);

  const [navOpen, setNavOpen] = useContext(NavbarContext);
  const links = [
    { title: "Home", path: "/" },
    { title: "Projects", path: "/projects" },
    { title: "About", path: "/about" },
    { title: "Blog", path: "/blog" },
    { title: "Contact", path: "/contact" },
  ];
  function gsapAnimation() {
    const tl = gsap.timeline();
    tl.to(".fullscreennav", {
      display: "block",
    });
    tl.to(".stairing", {
      delay: 0.2,
      height: "100%",
      stagger: {
        amount: -0.3,
      },
    });
    tl.to(".link", {
      opacity: 1,
      rotateX: 0,
      stagger: {
        amount: 0.3,
      },
    });
    tl.to(".navlink", {
      opacity: 1,
    });
  }
  function gsapAnimationReverse() {
    const tl = gsap.timeline();
    tl.to(".link", {
      opacity: 0,
      rotateX: 90,
      stagger: {
        amount: 0.1,
      },
    });
    tl.to(".stairing", {
      height: 0,
      stagger: {
        amount: 0.1,
      },
    });
    tl.to(".navlink", {
      opacity: 0,
    });
    tl.to(".fullscreennav", {
      display: "none",
    });
  }

  useGSAP(
    function () {
      if (navOpen) {
        gsapAnimation();
      } else {
        gsapAnimationReverse();
      }
    },
    [navOpen],
  );

  return (
    <div
      ref={fullScreenRef}
      id="fullscreennav"
      className="fullscreennav hidden text-white overflow-hidden h-screen w-full z-34 absolute">
      <div className="h-screen w-full fixed">
        <div className="h-full w-full flex">
          <div className="stairing h-full w-1/5 bg-black"></div>
          <div className="stairing h-full w-1/5 bg-black"></div>
          <div className="stairing h-full w-1/5 bg-black"></div>
          <div className="stairing h-full w-1/5 bg-black"></div>
          <div className="stairing h-full w-1/5 bg-black"></div>
        </div>
      </div>
      <div ref={fullNavLinksRef} className="relative">
        <div className="navlink flex w-full justify-between lg:p-5 p-2 items-start">
          <div>
            <div className="lg:w-36 w-24 lg:h-[100px] h-auto flex items-center">
              <img
                src={logo}
                alt="orBIS"
                className="w-28 lg:w-36 h-full object-contain"
              />
            </div>
          </div>
          <div
            onClick={() => {
              setNavOpen(false);
            }}
            className="lg:h-32 h-20 w-20 lg:w-32 relative cursor-pointer"
          >
            <div className="lg:h-44 h-28 lg:w-1 w-0.5 -rotate-45 origin-top absolute bg-primary"></div>
            <div className="lg:h-44 h-28 lg:w-1 w-0.5 right-0 rotate-45 origin-top absolute bg-secondary"></div>
          </div>
        </div>
        <div className="">
          {links.map((item, idx) => (
            <div
              key={idx}
              className="link group relative overflow-hidden border-t border-white cursor-pointer"
            >
              <h1
                className="
                relative z-10
                text-2xl
                lg:text-[3vw]
                text-center
                uppercase
                py-2 lg:py-3
                transition-all
                duration-500
                group-hover:text-black
                "
              >
                {item.title}
              </h1>
              <div
                className="
                absolute
                left-0
                top-full
                h-full
                w-full
                bg-primary
                transition-all
                duration-500
                group-hover:top-0
                "
              />
              <div
                className="
                absolute
                top-1/2
                -translate-y-1/2
                left-0
                w-full
                overflow-hidden
                opacity-0
                group-hover:opacity-100
                transition-all
                duration-300
                "
              >
                <div className="flex whitespace-nowrap animate-marquee">
                  <span className="mx-10 text-black text-3xl lg:text-6xl">
                    Explore {item.title}
                  </span>
                  <span className="mx-10 text-black text-3xl lg:text-6xl">
                    Explore {item.title}
                  </span>
                  <span className="mx-10 text-black text-3xl lg:text-6xl">
                    Explore {item.title}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FullScreenNav;
