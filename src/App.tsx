import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { HeaderProvider } from './contexts/HeaderContext';
import Navigation from './components/Navigation';
import Breadcrumbs from './components/Breadcrumbs';
import Footer from './components/Footer';
import FloatingButtons from './components/FloatingButtons';
import MobileStickyBar from './components/MobileStickyBar';
import ChristmasCountdown from './components/ChristmasCountdown';
import SkipToContent from './components/SkipToContent';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingFallback from './components/LoadingFallback';
import ErrorBoundary from './components/ErrorBoundary';
import { TopBarLoader } from './components/TopBarLoader';

// Lazy load all pages for better performance and code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const HouseWashingPage = lazy(() => import('./pages/HouseWashingPage'));
const RoofCleaningPage = lazy(() => import('./pages/RoofCleaningPage'));
const GetQuotePage = lazy(() => import('./pages/GetQuotePage'));
const InstantEstimatePage = lazy(() => import('./pages/InstantEstimatePage'));
const MobileMenuPage = lazy(() => import('./pages/MobileMenuPage'));
const MobileServicesMenuPage = lazy(() => import('./pages/MobileServicesMenuPage'));
const MobileCompanyMenuPage = lazy(() => import('./pages/MobileCompanyMenuPage'));
const DeckCleaningPage = lazy(() => import('./pages/DeckCleaningPage'));
const ConcreteCleaningPage = lazy(() => import('./pages/ConcreteCleaningPage'));
const HolidayLightsPage = lazy(() => import('./pages/HolidayLightsPage'));
const CommercialPage = lazy(() => import('./pages/CommercialPage'));
const CommercialLandingPage = lazy(() => import('./pages/CommercialLandingPage'));
const FleetWashingPage = lazy(() => import('./pages/FleetWashingPage'));
const HOACondoCleaningPage = lazy(() => import('./pages/HOACondoCleaningPage'));
const FinancingPage = lazy(() => import('./pages/FinancingPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const GutterCleaningPage = lazy(() => import('./pages/GutterCleaningPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage'));
const EmployeeLoginPage = lazy(() => import('./pages/EmployeeLoginPage'));
const EmployeeDashboardPage = lazy(() => import('./pages/EmployeeDashboardPage'));
const CreateEmployeePage = lazy(() => import('./pages/CreateEmployeePage'));
const CreateSalesUserPage = lazy(() => import('./pages/CreateSalesUserPage'));
const QuickMeasurePage = lazy(() => import('./pages/QuickMeasurePage'));
const QuotesDashboard = lazy(() => import('./pages/QuotesDashboard'));
const CustomerPortalPage = lazy(() => import('./pages/CustomerPortalPage'));
const GoogleDriveImportPage = lazy(() => import('./pages/GoogleDriveImportPage'));
const GalleryManagementPage = lazy(() => import('./pages/GalleryManagementPage'));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage'));
const ChatDashboard = lazy(() => import('./pages/ChatDashboard'));
const NewsletterSignupsDashboard = lazy(() => import('./pages/NewsletterSignupsDashboard'));
const WebsiteAnalyticsDashboard = lazy(() => import('./pages/WebsiteAnalyticsDashboard'));
const GoogleReviewUploadPage = lazy(() => import('./pages/GoogleReviewUploadPage'));
const FooterTestPage = lazy(() => import('./pages/FooterTestPage'));
// Town pages commented out - files don't exist
// import NorthSmithfieldRIPage from './pages/towns/north-smithfield-ri';
// import SmithfieldRIPage from './pages/towns/smithfield-ri';
// import WoonsocketRIPage from './pages/towns/woonsocket-ri';
// import CumberlandRIPage from './pages/towns/cumberland-ri';
// import LincolnRIPage from './pages/towns/lincoln-ri';
// import CentralFallsRIPage from './pages/towns/central-falls-ri';
// import PawtucketRIPage from './pages/towns/pawtucket-ri';
// import NorthProvidenceRIPage from './pages/towns/north-providence-ri';
// import ProvidenceRIPage from './pages/towns/providence-ri';
// import EastProvidenceRIPage from './pages/towns/east-providence-ri';
// import CranstonRIPage from './pages/towns/cranston-ri';
// import WarwickRIPage from './pages/towns/warwick-ri';
// import WestWarwickRIPage from './pages/towns/west-warwick-ri';
// import CoventryRIPage from './pages/towns/coventry-ri';
// import JohnstonRIPage from './pages/towns/johnston-ri';
// import FosterRIPage from './pages/towns/foster-ri';
// import GlocesterRIPage from './pages/towns/glocester-ri';
// import BurrillvilleRIPage from './pages/towns/burrillville-ri';
// import BlackstoneMAPage from './pages/towns/blackstone-ma';
// import MillvilleMAPage from './pages/towns/millville-ma';
// import UxbridgeMAPage from './pages/towns/uxbridge-ma';
// import DouglasMAPage from './pages/towns/douglas-ma';
// import NorthbridgeMAPage from './pages/towns/northbridge-ma';
// import WhitinsvilleMAPage from './pages/towns/whitinsville-ma';
// import GraftonMAPage from './pages/towns/grafton-ma';
// import SuttonMAPage from './pages/towns/sutton-ma';
// import MillburyMAPage from './pages/towns/millbury-ma';
// import ShrewsburyMAPage from './pages/towns/shrewsbury-ma';
// import FranklinMAPage from './pages/towns/franklin-ma';
// import BellinghamMAPage from './pages/towns/bellingham-ma';
// import WrenthamMAPage from './pages/towns/wrentham-ma';
// import PlainvilleMAPage from './pages/towns/plainville-ma';
// import NorthAttleboroughMAPage from './pages/towns/north-attleborough-ma';
// import AttleboroMAPage from './pages/towns/attleboro-ma';
// import MansfieldMAPage from './pages/towns/mansfield-ma';
// import FoxboroMAPage from './pages/towns/foxboro-ma';
// import RehobothMAPage from './pages/towns/rehoboth-ma';
// import SeekonkMAPage from './pages/towns/seekonk-ma';
// import SwanseaMAPage from './pages/towns/swansea-ma';
const HolidayLightsTownPage = lazy(() => import('./pages/HolidayLightsTownPage'));
const HolidayLightsTownPagesAdmin = lazy(() => import('./pages/HolidayLightsTownPagesAdmin'));
const TownsPage = lazy(() => import('./pages/TownsPage'));
const StateServiceAreaPage = lazy(() => import("./pages/StateServiceAreaPage"));
const TownPage = lazy(() => import('./pages/TownPage'));
const PlatinumMonthlyPage = lazy(() => import('./pages/PlatinumMonthlyPage'));
const GoldQuarterlyPage = lazy(() => import('./pages/GoldQuarterlyPage'));
const SilverSeasonalPage = lazy(() => import('./pages/SilverSeasonalPage'));
const CompleteYourQuotePage = lazy(() => import('./pages/CompleteYourQuotePage'));
const PricingAdministrationPage = lazy(() => import('./pages/PricingAdministrationPage'));
const SatisfactionGuaranteePage = lazy(() => import('./pages/SatisfactionGuaranteePage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const BlogPostPreviewPage = lazy(() => import('./pages/BlogPostPreviewPage'));
const BlogManagementPage = lazy(() => import('./pages/BlogManagementPage'));
const BlogEditorPage = lazy(() => import('./pages/BlogEditorPage'));
const SimpleBlogEditor = lazy(() => import('./components/blog/SimpleBlogEditor'));
const FacebookSettingsPage = lazy(() => import('./pages/FacebookSettingsPage'));
const GoogleBusinessSettingsPage = lazy(() => import('./pages/GoogleBusinessSettingsPage'));
const GoogleBusinessCallbackPage = lazy(() => import('./pages/GoogleBusinessCallbackPage'));
const EmailTemplatesPage = lazy(() => import('./pages/EmailTemplatesPage'));
const PopupManagementPage = lazy(() => import('./pages/PopupManagementPage'));
const PopupRenderer = lazy(() => import('./components/popup/PopupRenderer'));
const ApproveEstimatePage = lazy(() => import('./pages/ApproveEstimatePage'));
const EmailReportDashboard = lazy(() => import('./pages/EmailReportDashboard'));
const SitemapPage = lazy(() => import('./pages/SitemapPage'));
const SitemapManagementPage = lazy(() => import('./pages/SitemapManagementPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }
  }, [pathname, hash]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const isHomePage = (location.pathname.replace(/[/]+$/, '') || '/') === '/';
  const isHolidayLightsPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/holiday-lights';
  const isQuickMeasurePage = (location.pathname.replace(/[/]+$/, '') || '/') === '/quickmeasure';
  const isQuickMeasureEmailReportPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/quickmeasure-email-report';
  const isEmailReportPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/email-report';
  const isQuotesDashboardPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/quotes-dashboard';
  const isEmployeeDashboardPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/employee-dashboard';
  const isEmployeeLoginPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/employee-login';
  const isGoogleDriveImportPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/google-drive-import';
  const isGalleryManagementPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/gallery-management';
  const isUserManagementPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/user-management';
  const isChatDashboardPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/chat-dashboard';
  const isCreateEmployeePage = (location.pathname.replace(/[/]+$/, '') || '/') === '/create-employee';
  const isCreateSalesUserPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/create-sales-user';
  const isNewsletterSignupsPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/newsletter-signups';
  const isWebsiteAnalyticsPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/website-analytics';
  const isGoogleReviewUploadPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/google-review-upload';
  const isPricingAdministrationPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/pricing-administration';
  const isBlogManagementPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/blog-management' || location.pathname.startsWith('/blog-management/');
  const isGetQuotePage = (location.pathname.replace(/[/]+$/, '') || '/') === '/get-quote';
  const isFacebookSettingsPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/facebook-settings';
  const isGoogleBusinessSettingsPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/google-business-settings';
  const isEmailTemplatesPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/email-templates';
  const isSitemapManagementPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/sitemap-management';
  const isPopupManagementPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/popup-management';
  const isCommercialLandingPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/commercial-landing';
  const isMobileMenuPage = location.pathname.startsWith('/mobile-menu');
  const isInstantEstimatePage = (location.pathname.replace(/[/]+$/, '') || '/') === '/instant-estimate' || (location.pathname.replace(/[/]+$/, '') || '/') === '/quote';
  const isPrivacyPolicyPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/privacy-policy';

  const isEmployeePage = isQuickMeasurePage || isQuickMeasureEmailReportPage || isEmailReportPage || isQuotesDashboardPage ||
    isEmployeeDashboardPage || isEmployeeLoginPage || isGoogleDriveImportPage ||
    isGalleryManagementPage || isUserManagementPage || isChatDashboardPage ||
    isCreateEmployeePage || isCreateSalesUserPage || isNewsletterSignupsPage ||
    isWebsiteAnalyticsPage || isGoogleReviewUploadPage || isPricingAdministrationPage ||
    isBlogManagementPage || isFacebookSettingsPage || isGoogleBusinessSettingsPage ||
    isEmailTemplatesPage || isSitemapManagementPage || isPopupManagementPage;

  const isStandalonePage = isGetQuotePage || isEmployeePage || isCommercialLandingPage || isMobileMenuPage || isInstantEstimatePage || isPrivacyPolicyPage;

  return (
    <div className="min-h-screen bg-white">
      <SkipToContent />
      <TopBarLoader />
      {!isStandalonePage && <Navigation />}
      {!isStandalonePage && <Breadcrumbs />}
      <main id="main-content" role="main" className="pb-20 lg:pb-0">
      <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mobile-menu" element={<MobileMenuPage />} />
        <Route path="/mobile-menu/services" element={<MobileServicesMenuPage />} />
        <Route path="/mobile-menu/company" element={<MobileCompanyMenuPage />} />
        <Route path="/house-washing" element={<HouseWashingPage />} />
        <Route path="/roof-cleaning" element={<RoofCleaningPage />} />
        <Route path="/deck-cleaning" element={<DeckCleaningPage />} />
        <Route path="/concrete-cleaning" element={<ConcreteCleaningPage />} />
        <Route path="/holiday-lights" element={<HolidayLightsPage />} />
        <Route path="/holiday-lights/rhode-island" element={<StateServiceAreaPage service="holiday" stateAbbr="RI" />} />
        <Route path="/holiday-lights/massachusetts" element={<StateServiceAreaPage service="holiday" stateAbbr="MA" />} />
        <Route path="/holiday-lights/:slug" element={<HolidayLightsTownPage />} />
        <Route path="/holiday-lights-admin" element={<ProtectedRoute><HolidayLightsTownPagesAdmin /></ProtectedRoute>} />
        <Route path="/commercial" element={<CommercialPage />} />
        <Route path="/commercial-landing" element={<CommercialLandingPage />} />
        <Route path="/commercial/fleet-washing" element={<FleetWashingPage />} />
        <Route path="/hoa-condo-cleaning" element={<HOACondoCleaningPage />} />
        <Route path="/commercial/maintenance-programs/monthly-maintenance" element={<PlatinumMonthlyPage />} />
        <Route path="/commercial/maintenance-programs/quarterly-maintenance" element={<GoldQuarterlyPage />} />
        <Route path="/commercial/maintenance-programs/seasonal-maintenance" element={<SilverSeasonalPage />} />
        <Route path="/platinum-monthly" element={<PlatinumMonthlyPage />} />
        <Route path="/gold-quarterly" element={<GoldQuarterlyPage />} />
        <Route path="/silver-seasonal" element={<SilverSeasonalPage />} />
        <Route path="/financing" element={<FinancingPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/gutter-cleaning" element={<GutterCleaningPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/satisfaction-guarantee" element={<SatisfactionGuaranteePage />} />
        <Route path="/get-quote" element={<GetQuotePage />} />
        <Route path="/instant-estimate" element={<InstantEstimatePage />} />
        <Route path="/quote" element={<InstantEstimatePage />} />
        <Route path="/complete-quote" element={<CompleteYourQuotePage />} />
        <Route path="/customer-portal" element={<CustomerPortalPage />} />
        <Route path="/employee-login" element={<EmployeeLoginPage />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboardPage />} />
        <Route path="/create-employee" element={<CreateEmployeePage />} />
        <Route path="/create-sales-user" element={<CreateSalesUserPage />} />
        <Route path="/quotes-dashboard" element={<ProtectedRoute><QuotesDashboard /></ProtectedRoute>} />
        <Route path="/quickmeasure-email-report" element={<ProtectedRoute><EmailReportDashboard /></ProtectedRoute>} />
        <Route path="/email-report" element={<ProtectedRoute><EmailReportDashboard /></ProtectedRoute>} />
        <Route path="/quickmeasure" element={<ProtectedRoute><QuickMeasurePage /></ProtectedRoute>} />
        <Route path="/google-drive-import" element={<ProtectedRoute><GoogleDriveImportPage /></ProtectedRoute>} />
        <Route path="/gallery-management" element={<ProtectedRoute><GalleryManagementPage /></ProtectedRoute>} />
        <Route path="/user-management" element={<ProtectedRoute><UserManagementPage /></ProtectedRoute>} />
        <Route path="/chat-dashboard" element={<ProtectedRoute><ChatDashboard /></ProtectedRoute>} />
        <Route path="/newsletter-signups" element={<ProtectedRoute><NewsletterSignupsDashboard /></ProtectedRoute>} />
        <Route path="/website-analytics" element={<ProtectedRoute><WebsiteAnalyticsDashboard /></ProtectedRoute>} />
        <Route path="/google-review-upload" element={<ProtectedRoute><GoogleReviewUploadPage /></ProtectedRoute>} />
        <Route path="/pricing-administration" element={<ProtectedRoute><PricingAdministrationPage /></ProtectedRoute>} />
        <Route path="/facebook-settings" element={<ProtectedRoute><FacebookSettingsPage /></ProtectedRoute>} />
        <Route path="/google-business-settings" element={<ProtectedRoute><GoogleBusinessSettingsPage /></ProtectedRoute>} />
        <Route path="/google-business-callback" element={<GoogleBusinessCallbackPage />} />
        <Route path="/email-templates" element={<ProtectedRoute><EmailTemplatesPage /></ProtectedRoute>} />
        <Route path="/sitemap-management" element={<ProtectedRoute><SitemapManagementPage /></ProtectedRoute>} />
        <Route path="/popup-management" element={<ProtectedRoute><PopupManagementPage /></ProtectedRoute>} />
        <Route path="/approve-estimate" element={<ApproveEstimatePage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/blog-management" element={<ProtectedRoute><BlogManagementPage /></ProtectedRoute>} />
        <Route path="/blog-management/new" element={<ProtectedRoute><SimpleBlogEditor /></ProtectedRoute>} />
        <Route path="/blog-management/simple/:id" element={<ProtectedRoute><SimpleBlogEditor /></ProtectedRoute>} />
        <Route path="/blog-management/:id" element={<ProtectedRoute><BlogEditorPage /></ProtectedRoute>} />
        <Route path="/blog-management/edit/:id" element={<ProtectedRoute><BlogEditorPage /></ProtectedRoute>} />
        <Route path="/blog-management/preview/:id" element={<ProtectedRoute><BlogPostPreviewPage /></ProtectedRoute>} />
        <Route path="/footer-test" element={<FooterTestPage />} />
        <Route path="/towns" element={<TownsPage />} />
        <Route path="/towns/rhode-island" element={<StateServiceAreaPage service="washing" stateAbbr="RI" />} />
        <Route path="/towns/massachusetts" element={<StateServiceAreaPage service="washing" stateAbbr="MA" />} />
        <Route path="/towns/:slug" element={<TownPage />} />
        <Route path="/sitemap" element={<SitemapPage />} />
        {/* Catch-all 404 route - must be last */}
        <Route path="*" element={<NotFoundPage />} />
        {/* Individual town routes now handled by dynamic route above */}
        {/* <Route path="/towns/north-smithfield-ri" element={<NorthSmithfieldRIPage />} /> */}
        {/* <Route path="/towns/smithfield-ri" element={<SmithfieldRIPage />} /> */}
        {/* <Route path="/towns/woonsocket-ri" element={<WoonsocketRIPage />} /> */}
        {/* <Route path="/towns/cumberland-ri" element={<CumberlandRIPage />} /> */}
        {/* <Route path="/towns/lincoln-ri" element={<LincolnRIPage />} /> */}
        {/* <Route path="/towns/central-falls-ri" element={<CentralFallsRIPage />} /> */}
        {/* <Route path="/towns/pawtucket-ri" element={<PawtucketRIPage />} /> */}
        {/* <Route path="/towns/north-providence-ri" element={<NorthProvidenceRIPage />} /> */}
        {/* <Route path="/towns/providence-ri" element={<ProvidenceRIPage />} /> */}
        {/* <Route path="/towns/east-providence-ri" element={<EastProvidenceRIPage />} /> */}
        {/* <Route path="/towns/cranston-ri" element={<CranstonRIPage />} /> */}
        {/* <Route path="/towns/warwick-ri" element={<WarwickRIPage />} /> */}
        {/* <Route path="/towns/west-warwick-ri" element={<WestWarwickRIPage />} /> */}
        {/* <Route path="/towns/coventry-ri" element={<CoventryRIPage />} /> */}
        {/* <Route path="/towns/johnston-ri" element={<JohnstonRIPage />} /> */}
        {/* <Route path="/towns/foster-ri" element={<FosterRIPage />} /> */}
        {/* <Route path="/towns/glocester-ri" element={<GlocesterRIPage />} /> */}
        {/* <Route path="/towns/burrillville-ri" element={<BurrillvilleRIPage />} /> */}
        {/* <Route path="/towns/blackstone-ma" element={<BlackstoneMAPage />} /> */}
        {/* <Route path="/towns/millville-ma" element={<MillvilleMAPage />} /> */}
        {/* <Route path="/towns/uxbridge-ma" element={<UxbridgeMAPage />} /> */}
        {/* <Route path="/towns/douglas-ma" element={<DouglasMAPage />} /> */}
        {/* <Route path="/towns/northbridge-ma" element={<NorthbridgeMAPage />} /> */}
        {/* <Route path="/towns/whitinsville-ma" element={<WhitinsvilleMAPage />} /> */}
        {/* <Route path="/towns/grafton-ma" element={<GraftonMAPage />} /> */}
        {/* <Route path="/towns/sutton-ma" element={<SuttonMAPage />} /> */}
        {/* <Route path="/towns/millbury-ma" element={<MillburyMAPage />} /> */}
        {/* <Route path="/towns/shrewsbury-ma" element={<ShrewsburyMAPage />} /> */}
        {/* <Route path="/towns/franklin-ma" element={<FranklinMAPage />} /> */}
        {/* <Route path="/towns/bellingham-ma" element={<BellinghamMAPage />} /> */}
        {/* <Route path="/towns/wrentham-ma" element={<WrenthamMAPage />} /> */}
        {/* <Route path="/towns/plainville-ma" element={<PlainvilleMAPage />} /> */}
        {/* <Route path="/towns/north-attleborough-ma" element={<NorthAttleboroughMAPage />} /> */}
        {/* <Route path="/towns/attleboro-ma" element={<AttleboroMAPage />} /> */}
        {/* <Route path="/towns/mansfield-ma" element={<MansfieldMAPage />} /> */}
        {/* <Route path="/towns/foxboro-ma" element={<FoxboroMAPage />} /> */}
        {/* <Route path="/towns/rehoboth-ma" element={<RehobothMAPage />} /> */}
        {/* <Route path="/towns/seekonk-ma" element={<SeekonkMAPage />} /> */}
        {/* <Route path="/towns/swansea-ma" element={<SwanseaMAPage />} /> */}
      </Routes>
      </Suspense>
      </main>
        {isHolidayLightsPage && <ChristmasCountdown />}
        {!isStandalonePage && <FloatingButtons />}
        {!isStandalonePage && <MobileStickyBar />}
        {!isStandalonePage && !isHomePage && <Footer />}
        {isHomePage && (
          <Suspense fallback={null}>
            <PopupRenderer />
          </Suspense>
        )}
      </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <HeaderProvider>
          <AuthProvider>
            <ScrollToTop />
            <AppContent />
          </AuthProvider>
        </HeaderProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
