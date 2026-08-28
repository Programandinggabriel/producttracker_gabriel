"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initFlowbite } from "flowbite";

export default function FlowbiteInitializer() {
  const pathname = usePathname();

  useEffect(() => {
    initFlowbite();
  }, [pathname]);

  return null;
}
