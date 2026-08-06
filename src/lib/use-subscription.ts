/**
 * Which plan the person at the keyboard is on, for the interface's benefit.
 *
 * FOR UI AFFORDANCES ONLY. Everything here reads a copy of the subscription
 * that has already been sent to the browser, and anything in a browser can be
 * edited: someone with the devtools open can flip `allowed` to true and the
 * upgrade prompt will turn into a working-looking button. That is fine, because
 * the button is a hint about what to show — never a decision about what may
 * happen.
 *
 * The server must run the same check independently, on every request that does
 * paid work or returns paid data (`hasFeature()` in subscriptions.server.ts).
 * A client-side gate is a hint, not a security boundary. If removing this file
 * would let anyone get a Pro feature for free, the check is in the wrong place.
 */

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { planHasFeature, type Feature } from "@/lib/pricing";
import { getSubscription } from "@/lib/subscriptions.functions";

/**
 * The current subscription.
 *
 * One query key for the whole app, so the top bar, a paywall prompt and the
 * billing page can never disagree about what someone is paying for.
 */
export function useSubscription() {
  const fetchSubscription = useServerFn(getSubscription);
  return useQuery({ queryKey: ["subscription"], queryFn: () => fetchSubscription() });
}

/**
 * Whether to *show* a feature as available.
 *
 * Defaults to not allowed while loading and if the query fails, so a slow
 * network shows the upgrade path rather than briefly promising something the
 * server will then refuse.
 */
export function useHasFeature(feature: Feature) {
  const { data: subscription, isLoading } = useSubscription();

  return {
    allowed: subscription ? planHasFeature(subscription.plan, feature) : false,
    loading: isLoading,
    subscription,
  };
}
