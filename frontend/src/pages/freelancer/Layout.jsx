import { Outlet } from "react-router-dom";
import { Footer, MobileNav, ScrollToTop, ScrollToTopIcon, SearchFormPopUp, FreelancerHeader } from "../../components";
import { Toaster } from "react-hot-toast";
import { usePopUp } from "../../contexts/PopUpContextProvider";
import { lazy, Suspense } from "react";

function Layout(){
    const { isPopupOpen, closePopup } = usePopUp();
    const isSearchFormPopUpOpen = isPopupOpen('searchForm');
    return (
        <>
            <ScrollToTop />
            <ScrollToTopIcon />
            <Toaster />
            {/* <FreelancerHeader /> */}
            {/* <MobileNav /> */}
            <Outlet />
            <Footer />
            {isSearchFormPopUpOpen && <SearchFormPopUp closePopup={closePopup} />}
        </>
    );
}

export default Layout;