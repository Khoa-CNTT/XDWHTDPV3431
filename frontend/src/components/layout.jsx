import { Outlet } from "react-router-dom";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";
const LayoutClient = () => {
    return (
        <>
            <Navbar />
            <div className="main">
                <Outlet />
            </div>
            <Footer />
        </>
    )
}
export default LayoutClient;