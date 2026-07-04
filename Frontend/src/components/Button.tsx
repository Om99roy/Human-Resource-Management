type ButtonProps = {
  text: string;
};

const Button = ({ text }: ButtonProps) => {
  return (
    <div className="">
      <span className="text-[6.5vw] leading-[5.5vw] border-4 border-white rounded-full px-14 pt-5 uppercase">
        {text}
      </span>
    </div>
  );
};

export default Button;
