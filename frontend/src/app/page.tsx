"use client";
import Image from "next/image";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { SignUpButton, UserButton } from "@clerk/nextjs";
import {
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";
const Home: React.FC = () => {
  const { user } = useUser();
  const router = useRouter();

  const handleAdminClick = () => {
    router.push(`/admin`);
  };

  const handleLoginClick = () => {
    router.push(`/join`);
  };

  return (
    <>
      <div
        className="w-full min-h-[330vh] flex flex-col items-center p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]"
        style={{
          backgroundImage: "url('/wpe.svg')",
          backgroundSize: "100% auto", // Ensures full width, auto height
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Navbar */}
        <div className="w-full absolute top-0 left-0 flex items-center justify-between px-8 py-6 z-50 bg-transparent h-20">
          {/* Empty Left Section */}
          <div className="flex-1"></div>

          {/* Centered Middle Section: Pricing, Features, Customers */}
          <div className="flex items-center gap-10 font-roboto font-medium text-black">
            <a
              href="#" // Add your link here
              className="text-base hover:text-gray-600 transition-colors duration-200"
            >
              Pricing
            </a>
            <a
              href="#aboutus" // Add your link here
              className="text-base hover:text-gray-600 transition-colors duration-200"
            >
              About Us
            </a>
            <a
              href="#" // Add your link here
              className="text-base hover:text-gray-600 transition-colors duration-200"
            >
              Customers
            </a>
          </div>

          {/* Right Section: Sign In | Sign Up */}
          <div className="flex-1 flex justify-end items-center gap-4">
            <SignedIn>
              <div className="flex items-center gap-2 backdrop-blur-md p-2 rounded-lg">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>

            <SignedOut>
              <div className="flex items-center gap-4">
                <SignInButton>
                  <a
                    href="#"
                    className="text-base text-black hover:text-gray-600 transition-colors duration-200"
                  >
                    Sign In
                  </a>
                </SignInButton>
                <div className="h-4 w-[1px] bg-black"></div>{" "}
                {/* Vertical divider */}
                <SignUpButton>
                  <a
                    href="#"
                    className="text-base text-black hover:text-gray-600 transition-colors duration-200"
                  >
                    Sign Up
                  </a>
                </SignUpButton>
              </div>
            </SignedOut>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center  mt-60 text-center text-white relative py-12 px-8 left-15">
          {/* Content Section */}
          <SignedIn>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-black">
                Welcome, {user?.firstName || "User"}! 👋
              </h2>
              <p className="mt-2 text-gray-600 font-medium">
                You are all set now! Manage teams, assign tasks, and track
                projects effortlessly. Let’s make today productive. 🚀
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <button
                  className="px-6 py-3 bg-gradient-to-r from-[#c8009c] to-[#a10080] text-white rounded-full transition-all hover:from-[#a10080] hover:to-[#c8009c] hover:scale-105 hover:shadow-lg"
                  onClick={handleAdminClick}
                >
                  Create as Admin
                </button>
                <button
                  className="px-6 py-3 bg-transparent text-black border-2 border-black rounded-full transition-all hover:bg-[#c8009c] hover:text-white hover:border-[#c8009c] hover:scale-105 hover:shadow-lg"
                  onClick={handleLoginClick}
                >
                  Join Organization
                </button>
              </div>
            </div>
          </SignedIn>

          <SignedOut>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-black">
                Welcome to Deskly! 🚀
              </h2>
              <p className="mt-2 text-gray-600 font-medium">
                Organize your team, streamline tasks, and achieve more—all in
                one place. Sign in to get started and take control of your
                organization today!
              </p>
              <SignInButton mode="modal">
                <button className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full transition-all hover:from-blue-700 hover:to-blue-600 hover:scale-105 hover:shadow-lg animate-gradient-x-fast hover:animate-pulse-fast">
                  Let's Go
                </button>
              </SignInButton>
            </div>
          </SignedOut>
        </div>
        <div className="bg-transparent h-[1050px] w-20"></div>
        <div className=" h-[630px] w-full px-8 flex flex-col justify-start" id="aboutus">
          {/* Heading */}
          <h2 className="text-4xl font-bold text-black mb-8 font-dm">
            What We Do? 🤔
          </h2>

          {/* Content */}
          <div className="text-left space-y-6 max-w-2xl font-spaceGrotesk">
            <p className="text-xl text-gray-700 ">
              At Deskly, we turn chaos into clarity! 🎯 Whether you're juggling
              tasks, managing teams, or chasing deadlines, we’ve got your back.
            </p>
            <p className="text-xl text-gray-700 ">
              Think of us as your{" "}
              <span className="font-bold text-black">
                ultimate productivity sidekick
              </span>
              —helping you organize, collaborate, and conquer your goals like a
              pro. 💪
            </p>
          </div>
          <div className="flex h-48 w-50 mt-48  gap-10 ml-16">
            {/* Step 1: Create & Add */}
            <div className="  h-48 w-64 flex flex-col items-center justify-center p-4 text-center transition-all hover:scale-105 hover:shadow-lg">
              <h3 className="text-xl font-bold text-black mb-2">
                1. Create & Add{" "}
                <span className="inline-block animate-bounce">👥</span>
              </h3>
              <p className="font-playfair  text-black text-base  opacity-75">
                Start by creating your organization and get everyone on board in
                seconds!
              </p>
            </div>

            {/* Step 2: Set & Plan */}
            <div className="  h-48 w-64 flex flex-col items-center justify-center p-4 text-center transition-all hover:scale-105 hover:shadow-lg">
              <h3 className="text-xl font-bold text-black mb-2">
                2. Set & Plan{" "}
                <span className="inline-block animate-bounce">📅</span>
              </h3>
              <p className="text-black font-playfair opacity-75">
                Set up projects, assign tasks, and define deadlines. Stay
                organized and on track!
              </p>
            </div>

            {/* Step 3: Collaborate & Conquer */}
            <div className="  h-48 w-64 flex flex-col items-center justify-center p-4 text-center transition-all hover:scale-105 hover:shadow-lg">
              <h3 className="text-xl font-bold text-black mb-2">
                3. Collaborate{" "}
                <span className="inline-block animate-bounce">🚀</span>
              </h3>
              <p className="text-black font-playfair opacity-75">
                Work together, track progress, and crush your goals. Celebrate
                every win along the way!
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="w-full bg-black text-white py-8 px-4 sm:px-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          {/* Left - Logo & Copyright */}
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl font-bold">Deskly</h2>
            <p className="text-sm text-gray-400 mt-1">
              © {new Date().getFullYear()} Deskly. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Designed with ❤️ by{" "}
              <a
                href="https://www.linkedin.com/in/manav-singh-68a722258/" // Replace with actual LinkedIn link
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-300"
              >
                Manav Singh
              </a>
            </p>
          </div>

          {/* Center - Navigation Links */}
          <div className="flex space-x-6 text-gray-400">
            <a href="#" className="hover:text-white">
              About
            </a>
            <a href="/#" className="hover:text-white">
              Services
            </a>
            <a href="#" className="hover:text-white">
              Contact
            </a>
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>
          </div>

          {/* Right - Social Media Icons */}
          <div className="flex space-x-4">
            <a
              href="https://www.linkedin.com/in/himanshu-bhatt-a26718331/"
        
            >
              <FaInstagram className="h-6 w-6 bg-white text-black p-1 rounded-md hover:bg-gray-300 transition" />
            </a>
            <a
              href="https://www.linkedin.com/in/himanshu-bhatt-a26718331/"
             
            >
              <FaFacebookF className="h-6 w-6 bg-white text-black p-1 rounded-md hover:bg-gray-300 transition" />
            </a>
            <a
              href="https://www.linkedin.com/in/himanshu-bhatt-a26718331/"
            
            >
              <FaTwitter className="h-6 w-6 bg-white text-black p-1 rounded-md hover:bg-gray-300 transition" />
            </a>
            <a
              href="https://www.linkedin.com/in/himanshu-bhatt-a26718331/"
      
            >
              <FaLinkedinIn className="h-6 w-6 bg-white text-black p-1 rounded-md hover:bg-gray-300 transition" />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;
