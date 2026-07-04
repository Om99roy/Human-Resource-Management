import { useContext, useRef } from 'react';
import { NavbarColorContext, NavbarContext } from '../context/NavContext';
import logo from "../assets/orBIS.png";
const Navbar = () => {

    const navGreenRef = useRef<HTMLDivElement | null>(null)
    const [navOpen,setNavOpen] = useContext(NavbarContext)
    const [navColor, setNavColor] = useContext(NavbarColorContext)

    return (
        <div className='z-4 flex fixed top-0 w-full items-start justify-between'>
            <div className='pt-3.5 lg:pl-10'>
                <div className='lg:w-28 w-15 h-auto'>
			<img src={logo} alt='Logo' className='w-28 lg:w-36 h-auto object-contain' />
                </div>
            </div>
            <div onClick={()=>{
                setNavOpen(true)
            }} onMouseEnter={() => {
		if(navGreenRef.current) navGreenRef.current.style.height = '100%';
            }}
                onMouseLeave={() => {
	 	    if(navGreenRef.current) navGreenRef.current.style.height = '0%';
                }}
                className='lg:h-16 h-10 bg-black relative lg:w-[16vw] w-48'>
                <div ref={navGreenRef} className='bg-primary transition-all absolute top-0 h-0 w-full'></div>
                <div className='cursor-pointer relative h-full lg:px-12 px-8 flex flex-col justify-center items-end lg:gap-1.5 gap-0.5'>
                    <div className="lg:w-18 w-12 h-0.5 bg-white"></div>
                    <div className="lg:w-10 w-6 h-0.5 bg-white"></div>
                </div>
            </div>
        </div>
    )
}

export default Navbar
