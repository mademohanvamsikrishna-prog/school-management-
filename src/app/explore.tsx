/**
 * explore.tsx — Expo starter template screen (unused).
 *
 * This file was part of the Expo SDK template. It is not linked to any
 * navigation route in this app. It is kept as a stub to avoid breaking
 * anything that might reference the route in future tooling.
 *
 * If you want to repurpose this route, replace the content below.
 */
import { Redirect } from 'expo-router';

/** Immediately redirect anyone who lands here back to the login screen. */
export default function ExploreScreen() {
  return <Redirect href="/" />;
}
