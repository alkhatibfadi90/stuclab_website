// LabKit tool pages (/labkit/{category}/{tool}) bring their own topbar and
// footer via the .labkit-page chrome, so this layout adds no Navbar/Footer.
export default function ToolLayout({ children }) {
  return <main id="main-content">{children}</main>;
}
