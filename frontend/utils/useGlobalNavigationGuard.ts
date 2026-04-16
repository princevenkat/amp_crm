import { useEffect } from "react";

export default function useGlobalNavigationGuard(shouldBlock: boolean) {
  useEffect(() => {
    const handlePopState = () => {
      if (shouldBlock) {
        const confirmLeave = window.confirm(
          "You have unsaved changes. Are you sure you want to leave?",
        );

        if (!confirmLeave) {
          window.history.pushState(null, "", window.location.href);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [shouldBlock]);
}
