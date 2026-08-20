import Navbar from "./components/Navbar";
import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import ProfilePage from "./pages/ProfilePage";
import CreatePage from "./pages/CreatePage";
import EditProductPage from "./pages/EditProductPage";
import useAuthReq from "./hooks/useAuthReq";
import useUserSync from "./hooks/useUserSync";

function App() {
  const { isClerkLoaded, isSignedIn } = useAuthReq();
  const { isSynced, isError, noEmail } = useUserSync();

  if (!isClerkLoaded) return null;

  if (isSignedIn && noEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100 p-8">
        <div className="card bg-base-300 max-w-md w-full">
          <div className="card-body items-center text-center gap-3">
            <h2 className="card-title">Email required</h2>
            <p className="text-sm text-base-content/70">
              Your account needs an email address before you can sync and manage
              products.
            </p>
            <p className="text-xs text-base-content/50">
              Add an email to your Clerk account and this page will update
              automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isSignedIn && !isSynced && !isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/product/:id"
            element={<ProductPage />}
          />
          <Route
            path="/profile"
            element={isSignedIn ? <ProfilePage /> : <Navigate to={"/"} />}
          />
          <Route
            path="/create"
            element={isSignedIn ? <CreatePage /> : <Navigate to={"/"} />}
          />
          <Route
            path="/edit/:id"
            element={isSignedIn ? <EditProductPage /> : <Navigate to={"/"} />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
