import { useAuth, useUser } from "@clerk/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { syncUser } from "../lib/api";

export default function useUserSync() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [syncedUserId, setSyncedUserId] = useState(null);

  const {
    mutate: syncUserMutation,
    isPending,
    isSuccess,
    isError,
  } = useMutation({
    mutationFn: syncUser,
    retry: 3,
    retryDelay: 1000,
    onSuccess: (_data, variables) => setSyncedUserId(variables.userId),
    onError: (error) => {
      console.error("Failed to sync user", {
        status: error.response?.status,
      });
    },
  });

  useEffect(() => {
    if (!isSignedIn || !user) return;

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) {
      console.error("User has no primary email");
      return;
    }
    syncUserMutation({
      userId: user.id,
      email,
      name: user.fullName || user.firstName || "",
      imageUrl: user.imageUrl || "",
    });
  }, [isSignedIn, user, syncUserMutation]);

  const noEmail =
    isSignedIn && !!user && !user.primaryEmailAddress?.emailAddress;

  const isSynced = isSuccess && syncedUserId === user?.id;

  return { isSynced, isPending, isError, noEmail };
}
