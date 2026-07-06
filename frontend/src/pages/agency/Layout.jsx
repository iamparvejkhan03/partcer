import { Outlet } from "react-router-dom";
import { Footer, MobileNav, ScrollToTop, ScrollToTopIcon, SearchFormPopUp, AgencyHeader } from "../../components";
import { Toaster } from "react-hot-toast";
import { usePopUp } from "../../contexts/PopUpContextProvider";

function Layout(){
    const { isPopupOpen, closePopup } = usePopUp();
    const isSearchFormPopUpOpen = isPopupOpen('searchForm');
    return (
        <>
            <ScrollToTop />
            <ScrollToTopIcon />
            <Toaster />
            {/* <AgencyHeader /> */}
            {/* <MobileNav /> */}
            <Outlet />
            <Footer />
            {isSearchFormPopUpOpen && <SearchFormPopUp closePopup={closePopup} />}
        </>
    );
}

export default Layout;