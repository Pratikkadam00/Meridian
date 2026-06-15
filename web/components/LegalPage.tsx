import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// Shared shell for legal pages. Every legal page carries the visible
// "Template — review with a lawyer" flag per spec §10.
export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main>
      <section className="page-hero" style={{ paddingBottom: "50px" }}>
        <div className="grid-bg" />
        <Nav />
        <div className="wrap">
          <div className="eyebrow lime mono">Legal</div>
          <h1>{title}</h1>
          <p className="updated">Last updated {updated}</p>
        </div>
      </section>

      <section className="section deep">
        <div className="wrap">
          <div className="prose">{children}</div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
