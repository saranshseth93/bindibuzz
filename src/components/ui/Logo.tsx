import Image from "next/image";
import { FC } from "react";
import logo from "../../../public/logo.png";

interface LogoProps {}

const Logo: FC<LogoProps> = ({}) => {
  return (
    <>
      <div className="flex flex-col items-center">
        <Image src={logo} alt="Logo" className="w-2/3" />
        <h1 className="text-center text-4xl font-gengboy text-bindi-brown">
          B<span className="i">i</span>nd<span className="i">i</span> Buzz
        </h1>
      </div>
    </>
  );
};

export default Logo;
