import Image from "next/image";
import { FC } from "react";
import logo from "../../../public/logo.png";

interface LogoProps {
  className?: string;
  textSize?: string;
}

const Logo: FC<LogoProps> = ({ className = "w-auto", textSize = "4xl" }) => {
  return (
    <>
      <div className="flex flex-col items-center">
        <Image src={logo} alt="Logo" className={className} />
        <h1 className={`text-center ${textSize} font-gengboy text-bindi-brown`}>
          B<span className="i">i</span>nd<span className="i">i</span> Buzz
        </h1>
      </div>
    </>
  );
};

export default Logo;
