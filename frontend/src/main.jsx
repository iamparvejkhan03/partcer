import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoadingSpinner, NotFound, Protected } from './components';
import { PopUpContextProvider } from './contexts/PopUpContextProvider';
import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CurrencyProvider } from './hooks/useCurrency.jsx';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const AllFreelancers = lazy(() => import('./pages/AllFreelancers'));
const AllServices = lazy(() => import('./pages/AllServices'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const ServiceDetails = lazy(() => import('./pages/ServiceDetails'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
const AllProjects = lazy(() => import('./pages/AllProjects'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQs = lazy(() => import('./pages/FAQs'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const SingleFreelancer = lazy(() => import('./pages/FreelancerProfile'));
const Checkout = lazy(() => import('./pages/Checkout'));

//Freelancer Pages
const FreelancerLayout = lazy(() => import('./pages/freelancer/Layout'));
const FreelancerDashboard = lazy(() => import('./pages/freelancer/Dashboard'));
const FreelancerProfile = lazy(() => import('./pages/freelancer/Profile'));
const FreelancerAccountSettings = lazy(() => import('./pages/freelancer/AccountSettings'));
const CreateService = lazy(() => import('./pages/freelancer/CreateService'));
const EditService = lazy(() => import('./pages/freelancer/EditService'));
const FreelancerAllServices = lazy(() => import('./pages/freelancer/AllServices'));
const FreelancerAllOrders = lazy(() => import('./pages/freelancer/NewAllOrders'));
const FreelancerBilling = lazy(() => import('./pages/freelancer/Billing'));
const FreelancerPortfolio = lazy(() => import('./pages/freelancer/Portfolio'));
const FreelancerWithdrawals = lazy(() => import('./pages/freelancer/Withdrawals'));
const FreelancerEarnings = lazy(() => import('./pages/freelancer/Earnings'));
const FreelancerProjects = lazy(() => import('./pages/freelancer/Projects'));
const FreelancerChat = lazy(() => import('./pages/freelancer/Chat'));
const FreelancerOrderDetails = lazy(() => import('./pages/freelancer/OrderDetails'));
const FreelancerAppliedProjects = lazy(() => import('./pages/freelancer/AppliedProjects'));

//Buyer Pages
const BuyerLayout = lazy(() => import('./pages/buyer/Layout'));
const BuyerDashboard = lazy(() => import('./pages/buyer/Dashboard'));
const BuyerAllOrders = lazy(() => import('./pages/buyer/NewAllOrders'));
const BuyerProfile = lazy(() => import('./pages/buyer/Profile'));
const BuyerAccountSettings = lazy(() => import('./pages/buyer/AccountSettings'));
const BuyerBilling = lazy(() => import('./pages/buyer/Billing'));
const CreateProject = lazy(() => import('./pages/buyer/CreateProject'));
const EditProject = lazy(() => import('./pages/buyer/EditProject'));
const BuyerAllProjects = lazy(() => import('./pages/buyer/AllProjects'));
const BuyerChat = lazy(() => import('./pages/buyer/Chat'));
const BuyerOrderDetails = lazy(() => import('./pages/buyer/OrderDetails'));

//Admin Pages
const AdminLayout = lazy(() => import('./pages/admin/Layout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminAllUsers = lazy(() => import('./pages/admin/AllUsers'));
const AdminEditUser = lazy(() => import('./pages/admin/EditUser'));
const AdminAllServices = lazy(() => import('./pages/admin/AllServices'));
const AdminEditService = lazy(() => import('./pages/admin/EditService'));
const AdminAllProjects = lazy(() => import('./pages/admin/AllProjects'));
const AdminEditProject = lazy(() => import('./pages/admin/EditProject'));
const AdminAllOrders = lazy(() => import('./pages/admin/NewAllOrders'));
const AdminWithdrawals = lazy(() => import('./pages/admin/Withdrawals'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminSkills = lazy(() => import('./pages/admin/Skills'));
const AdminProfile = lazy(() => import('./pages/admin/Profile'));
const AdminTransactions = lazy(() => import('./pages/admin/Transactions'));
const AdminResolutionCenter = lazy(() => import('./pages/admin/ResolutionCenter'));

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <AuthProvider>
    <PopUpContextProvider>
      <CurrencyProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              {/* Root layout route */}
              <Route path="/" element={<App />}>
                <Route index element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <Home />
                  </Suspense>
                } />

                <Route path='/login' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <Login />
                  </Suspense>
                } />

                <Route path='/register' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <Register />
                  </Suspense>
                } />

                <Route path='/verify-email/:token' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <VerifyEmail />
                  </Suspense>
                } />

                <Route path='/freelancers' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <AllFreelancers />
                  </Suspense>
                } />

                <Route path='/freelancer/:freelancerId' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <SingleFreelancer />
                  </Suspense>
                } />

                {/* <Route path='/services' element={
                <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                  <AllServices />
                </Suspense>
              } /> */}

                <Route path='/about' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <About />
                  </Suspense>
                } />

                <Route path='/contact' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <Contact />
                  </Suspense>
                } />

                <Route path='/faqs' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <FAQs />
                  </Suspense>
                } />

                <Route path='/forgot-password' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <ForgotPassword />
                  </Suspense>
                } />

                <Route path='/reset-password/:token' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <ResetPassword />
                  </Suspense>
                } />

                <Route path='/terms-conditions' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <TermsOfUse />
                  </Suspense>
                } />

                <Route path='/privacy-policy' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <PrivacyPolicy />
                  </Suspense>
                } />

                {/* <Route path='/service/:serviceId' element={
                <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                  <ServiceDetails />
                </Suspense>
              } /> */}

                <Route path='/project/:projectId' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <ProjectDetails />
                  </Suspense>
                } />

                <Route path='/projects' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <AllProjects />
                  </Suspense>
                } />

                <Route path='/checkout' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <Checkout />
                  </Suspense>
                } />

                {/* Add this for not found routes */}
                <Route path="*" element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <NotFound />
                  </Suspense>
                } />
              </Route>

              {/* Freelancer Routes */}
              <Route path='/freelancer' element={
                <Protected authentication={true} userType='freelancer'>
                  <FreelancerLayout />
                </Protected>
              }>
                {/* Index route for freelancer */}
                <Route index element={
                  // <Navigate to="/freelancer/dashboard" replace />
                  <Navigate to="/freelancer/profile/settings" replace />
                } />

                {/* Freelancer dashboard */}
                {/* <Route path='dashboard' element={
                <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                  <FreelancerDashboard />
                </Suspense>
              } /> */}

                {/* Freelancer chat */}
                <Route path='chat' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <FreelancerChat />
                  </Suspense>
                } />

                {/* Freelancer profile routes with nested structure */}
                <Route path='profile'>
                  <Route index element={<Navigate to="settings" replace />} />
                  <Route path='settings' element={
                    <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                      <FreelancerProfile />
                    </Suspense>
                  } />
                  <Route path='portfolio' element={<FreelancerPortfolio />} />
                  <Route path='billing' element={<FreelancerBilling />} />
                  <Route path='account' element={
                    <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                      <FreelancerAccountSettings />
                    </Suspense>
                  } />
                </Route>

                {/* Freelancer create service */}
                {/* <Route path='services/create' element={
                <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                  <CreateService />
                </Suspense>
              } /> */}

                {/* Freelancer edit service */}
                {/* <Route path='services/edit/:serviceId' element={
                <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                  <EditService />
                </Suspense>
              } /> */}

                {/* Freelancer all services */}
                {/* <Route path='services/all' element={
                <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                  <FreelancerAllServices />
                </Suspense>
              } /> */}

                {/* Freelancer all orders */}
                <Route path='orders/all' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <FreelancerAllOrders />
                  </Suspense>
                } />

                {/* Freelancer single orders page */}
                <Route path='orders/:orderId' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <FreelancerOrderDetails />
                  </Suspense>
                } />

                {/* Freelancer finance routes with nested structure */}
                <Route path='finance'>
                  <Route index element={<Navigate to="earnings" replace />} />
                  <Route path='earnings' element={
                    <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                      <FreelancerEarnings />
                    </Suspense>
                  } />
                  <Route path='withdrawals' element={
                    <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                      <FreelancerWithdrawals />
                    </Suspense>
                  } />
                </Route>

                {/* <Route path='projects' element={
                <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                  <FreelancerProjects />
                </Suspense>
              } /> */}

                <Route path='projects/applied' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <FreelancerAppliedProjects />
                  </Suspense>
                } />

                {/* Add 404 for freelancer routes */}
                <Route path="*" element={<Navigate to="/freelancer/profile/settings" replace />} />
              </Route>

              {/* Buyer Routes - If you have them */}
              <Route path='/buyer' element={
                <Protected authentication={true} userType='buyer'>
                  <BuyerLayout />
                </Protected>
              }>
                {/* Index route for buyers */}
                <Route index element={
                  // <Navigate to="/buyer/dashboard" replace />
                  <Navigate to="/buyer/profile/settings" replace />
                } />

                {/* Buyer dashboard */}
                {/* <Route path='dashboard' element={
                <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                  <BuyerDashboard />
                </Suspense>
              } /> */}

                {/* buyer chat */}
                <Route path='chat' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <BuyerChat />
                  </Suspense>
                } />

                {/* Buyer all orders page */}
                <Route path='orders' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <BuyerAllOrders />
                  </Suspense>
                } />

                {/* Buyer all orders page */}
                <Route path='orders/:orderId' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <BuyerOrderDetails />
                  </Suspense>
                } />

                {/* Buyer create project */}
                <Route path='projects/create' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <CreateProject />
                  </Suspense>
                } />

                {/* Buyer all projects */}
                <Route path='projects/all' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <BuyerAllProjects />
                  </Suspense>
                } />

                {/* Buyer edit projects */}
                <Route path='projects/edit/:projectId' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <EditProject />
                  </Suspense>
                } />

                {/* Freelancer profile routes with nested structure */}
                <Route path='profile'>
                  <Route index element={<Navigate to="settings" replace />} />
                  <Route path='settings' element={
                    <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                      <BuyerProfile />
                    </Suspense>
                  } />
                  <Route path='billing' element={<BuyerBilling />} />
                  <Route path='account' element={
                    <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                      <BuyerAccountSettings />
                    </Suspense>
                  } />
                </Route>

                {/* Add 404 for buyer routes */}
                <Route path="*" element={<Navigate to="/buyer/profile/settings" replace />} />
              </Route>

              {/* Admin Routes */}
              <Route path='/admin' element={
                <Protected authentication={true} userType='admin'>
                  <AdminLayout />
                </Protected>
              }>
                {/* Index route for admin */}
                <Route index element={
                  <Navigate to="/admin/dashboard" replace />
                } />

                {/* Admin dashboard */}
                <Route path='dashboard' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <AdminDashboard />
                  </Suspense>
                } />

                {/* Admin user routes with nested structure */}
                <Route path='users'>
                  <Route index element={<Navigate to="all" replace />} />
                  <Route path='all' element={
                    <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                      <AdminAllUsers />
                    </Suspense>
                  } />
                  <Route path='edit/:userId' element={<AdminEditUser />} />
                </Route>

                {/* Admin service routes with nested structure */}
                {/* <Route path='services'>
                <Route index element={<Navigate to="all" replace />} />
                <Route path='all' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <AdminAllServices />
                  </Suspense>
                } />
                <Route path='edit/:serviceId' element={<AdminEditService />} />
              </Route> */}

                {/* Admin project routes with nested structure */}
                <Route path='projects'>
                  <Route index element={<Navigate to="all" replace />} />
                  <Route path='all' element={
                    <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                      <AdminAllProjects />
                    </Suspense>
                  } />
                  <Route path='edit/:projectId' element={<AdminEditProject />} />
                </Route>

                {/* Admin all orders */}
                <Route path='orders' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <AdminAllOrders />
                  </Suspense>
                } />

                {/* Admin all transactions */}
                <Route path='transactions' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <AdminTransactions />
                  </Suspense>
                } />

                {/* Admin all resolutions */}
                <Route path='resolutions' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <AdminResolutionCenter />
                  </Suspense>
                } />

                {/* Admin all withdrawals */}
                <Route path='withdrawals' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <AdminWithdrawals />
                  </Suspense>
                } />

                {/* Admin all categories */}
                <Route path='categories' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <AdminCategories />
                  </Suspense>
                } />

                {/* Admin all skills */}
                <Route path='skills' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <AdminSkills />
                  </Suspense>
                } />

                {/* Admin profile */}
                <Route path='profile' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <AdminProfile />
                  </Suspense>
                } />

                {/* Freelancer finance routes with nested structure */}
                {/* <Route path='finance'>
                <Route index element={<Navigate to="earnings" replace />} />
                <Route path='earnings' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <FreelancerEarnings />
                  </Suspense>
                } />
                <Route path='withdrawals' element={
                  <Suspense fallback={<LoadingSpinner height={'725px'} />}>
                    <FreelancerWithdrawals />
                  </Suspense>
                } />
              </Route> */}

                {/* Add 404 for admin routes */}
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </CurrencyProvider>
    </PopUpContextProvider>
  </AuthProvider>
  // </StrictMode>
)