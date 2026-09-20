/**
 * Nested layout for /r/* routes.
 *
 * This intentionally renders ONLY {children} — bypassing the root layout's
 * Navbar, StickyBar, and global fonts so restaurant pages are standalone
 * customer-facing landing pages.
 */
export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
