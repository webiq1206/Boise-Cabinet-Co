"use client";

import dynamic from "next/dynamic";

/**
 * The assistant renders nothing until its availability check answers, so it
 * has no server-rendered markup to preserve. Loading it as its own client
 * chunk keeps its code (and the estimate engine and scope helpers it pulls in)
 * out of the bundle every page hydrates with.
 */
export const LazyAssistantWidget = dynamic(
  () => import("./AssistantWidget").then((mod) => mod.AssistantWidget),
  { ssr: false },
);
