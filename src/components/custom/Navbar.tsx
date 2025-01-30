import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/button";

function Navbar() {
    // State for managing mobile menu visibility
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    // Access location and navigate for routing
    const location = useLocation();
    const navigate = useNavigate();

    // Handle the navigation to the app
    const handleGoToApp = () => {
        navigate("/dashboard");
    }

    // Handle navigation and close menu for mobile
    const handleNavigate = (path: string) => {
        navigate(path);
        setMenuOpen(false); // Close menu on selection
    };


    //   const handleUSDCdrop = async () => {
    //     try {
    //       const response = await axios.post(
    //         import.meta.env.VITE_BACKEND_URL + "/usdc-drop",
    //         {
    //           toAddress: publicKey?.toBase58(), // Replace with the actual destination wallet address
    //         }
    //       );

    //       console.log("USDC transferred successfully:", response.data);
    //       toast.success("1000 Test USDC transferred successfully");
    //     } catch (error) {
    //       console.error(
    //         "Error transferring USDC:",
    //         error.response ? error.response.data : error.message
    //       );
    //     }
    //   };

    //   const handleSOLdrop = async () => {
    //     try {
    //       const response = await axios.post(
    //         import.meta.env.VITE_BACKEND_URL + "/sol-drop",
    //         {
    //           destination: publicKey?.toBase58(), // Replace with actual destination wallet address
    //         }
    //       );

    //       console.log("SOL transferred successfully:", response.data);
    //       toast.success("0.01 SOL transferred successfully");
    //     } catch (error) {
    //       console.error(
    //         "Error transferring SOL:",
    //         error.response ? error.response.data : error.message
    //       );
    //     }
    //   };

    return (
        <nav className="relative flex flex-wrap items-center justify-between w-full p-4 md:px-10 py-7">
            {/* Left container: Logo */}
            <div className="text-3xl font-black md:text-5xl">Exira</div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
                <Button size={"icon"}
                    className="swap-rotate "
                    onClick={() => {
                        console.log("Menu clicked", menuOpen);
                        setMenuOpen(!menuOpen);
                    }}
                >
                    {/* Hamburger icon */}
                    {!menuOpen ? (
                        <svg
                            className="fill-current"
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 512 512"
                        >
                            <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
                        </svg>
                    ) : (
                        /* Close icon */
                        <svg
                            className="fill-current"
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 512 512"
                        >
                            <polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
                        </svg>
                    )}
                </Button>
            </div>

            {/* Right container: Navigation and buttons */}
            <div
                className={`${menuOpen ? "flex" : "hidden"
                    } flex-col md:flex md:flex-row items-center md:gap-4 absolute md:relative top-full left-0 w-full md:w-auto bg-white md:bg-transparent z-10 p-4 md:p-0 md:space-x-4`}
            >
                {/* Navigation links */}
                <div className="flex flex-col gap-4 md:flex-row md:gap-8 md:mr-6">
                    {["Home", "About us"].map((item, index) => (
                        <p key={index}
                            className={`text-base md:text-md hover:cursor-pointer hover:underline hover:underline-offset-2 ${location.pathname ===
                                    `/${item.toLowerCase().replace(/\s+/g, "-")}`
                                    ? "underline font-bold"
                                    : ""
                                }`}
                            onClick={() => {
                                if (item === "Home") {
                                    handleNavigate("/");
                                } else {
                                    handleNavigate(`/${item.toLowerCase().replace(/\s+/g, "-")}`);
                        }}}>
                            {item}
                        </p>
                    ))}
                </div>

                {/* Wallet and App buttons */}
                <div className="flex flex-col items-center gap-4 mt-4 md:flex-row md:mt-0">
                    <Button className="font-semibold " variant={"default"}
                    // onClick={() => {
                    //   // window.open("https://faucet.solana.com/", "_blank");
                    //   // toast.error("This feature is not available yet");
                    //   handleSOLdrop();
                    // }}
                    >
                        <p>Get 0.01 SOL</p>
                    </Button>
                    <Button className="font-semibold" variant={"default"}
                    // onClick={() => {
                    //   // window.open("https://faucet.solana.com/", "_blank");
                    //   // toast.error("This feature is not available yet");
                    //   handleUSDCdrop();
                    // }}
                    >
                        <p>Get 1000 Test USDC</p>
                    </Button>
                    <Button className="font-semibold" variant={"default"} onClick={() => setIsLogin(!isLogin)}>
                        Sign in
                    </Button>

                    {/* Conditionally render "Exira App" button */}
                    {!location.pathname.includes("/dashboard") && (
                        <>
                            {isLogin ? (
                                <Button className="font-semibold " variant={"default"} onClick={handleGoToApp}>
                                    <div className="flex flex-row items-center justify-center gap-2">
                                        <p>App</p>
                                        <FontAwesomeIcon icon={faChevronRight} size="2xs" />
                                    </div>
                                </Button>
                            ) : null}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
