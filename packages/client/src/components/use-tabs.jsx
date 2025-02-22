"use client";

import { useSearchParams, useRouter } from "next/navigation";

export const useTabs = (area, tabs, defaultTabKey) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTab = searchParams?.get(`${area}Tab`) || defaultTabKey;

  const setActiveTab = (key) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set(`${area}Tab`, key);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return {
    activeTab,
    setActiveTab,
    tabs,
  };
};
