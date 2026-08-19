import { useAuth, useUser } from "@clerk/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { syncUser } from "../lib/api";

export default function useUserSync() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const {
    mutate: syncUserMutation,
    isPending,
    isSuccess,
    isError,
  } = useMutation({
    mutationFn: syncUser,
    onError: (error) => {
      console.error("Failed to sync user:", error);
      console.error("Status:", error.response?.status);
      console.error("Response:", error.response?.data);
      console.error("Request:", error.config?.data);
    },
    // Optionally show a toast notfication or retry
  });

  useEffect(() => {
    if (isSignedIn && user && !isPending && !isSuccess && !isError) {
      const email = user.primaryEmailAddress?.emailAddress;

      if (!email) {
        console.error("User has no primary email");
        return;
      }
      syncUserMutation({
        email,
        name: user.fullName || user.firstName,
        imageUrl: user.imageUrl,
      });
    }
  }, [isSignedIn, user, syncUserMutation, isPending, isSuccess, isError]);

  return { isSynced: isSuccess };
}
