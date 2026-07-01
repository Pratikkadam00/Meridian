import type { Metadata } from "next";

import { createAnonClient } from "@/lib/supabase";

// Read-only client-facing portal (the design system's "ClientPortal" screen).
// Buyers never install the broker's app, so this is a public web page —
// authorized purely by a server-generated share token, never by RLS on the
// underlying tables (see supabase/functions/get-shared-deal). No construction
// progress % is shown: there is no DLD/Mashrooi build-status integration, so
// only real, app-tracked figures (the payment plan) are rendered — never a
// fabricated construction estimate.

export const metadata: Metadata = {
  title: "Your deal — Meridian",
  robots: { index: false, follow: false },
};

type MilestoneStatus = "paid" | "due" | "upcoming" | "overdue";

type SharedMilestone = {
  label: string;
  triggerLabel: string;
  percent: string;
  amountAed: string;
  dueDate: string | null;
  paidDate: string | null;
  status: MilestoneStatus;
};

type SharedDeal = {
  projectName: string;
  unit: string;
  developerName: string | null;
  brokerName: string | null;
  totalValueAed: string;
  handoverEstimate: string | null;
  paidToDateAed: string;
  paidPercent: number;
  nextMilestone: SharedMilestone | null;
  milestones: SharedMilestone[];
};

function formatAed(value: string | number) {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return "AED 0";
  }
  return `AED ${Math.round(numeric).toLocaleString("en-US")}`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "TBD";
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

async function fetchSharedDeal(token: string): Promise<{ deal: SharedDeal | null; error: string | null }> {
  const client = createAnonClient();

  if (!client) {
    return { deal: null, error: "This page is not configured." };
  }

  const { data, error } = await client.functions.invoke("get-shared-deal", { body: { token } });

  if (error) {
    return { deal: null, error: "This link is no longer valid." };
  }

  return { deal: data as SharedDeal, error: null };
}

export default async function SharedDealPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { deal, error } = await fetchSharedDeal(token);

  if (error || !deal) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.errorTitle}>Link unavailable</h1>
          <p style={styles.errorBody}>{error ?? "This link is no longer valid."}</p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.brandRow}>
          <span style={styles.brandMark}>Meridian</span>
        </div>
        <p style={styles.eyebrow}>{deal.brokerName ? `Your unit · shared by ${deal.brokerName}` : "Your unit"}</p>
        <h1 style={styles.projectName}>{deal.projectName}</h1>
        <p style={styles.metaLine}>
          {deal.unit}
          {deal.developerName ? ` · ${deal.developerName}` : ""}
        </p>
      </div>

      <div style={styles.body}>
        <section style={styles.card}>
          <div style={styles.progressRow}>
            <span style={styles.progressLabel}>You&apos;ve paid</span>
            <span style={styles.progressValue}>{deal.paidPercent}%</span>
          </div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${Math.max(0, Math.min(deal.paidPercent, 100))}%` }} />
          </div>
          <p style={styles.progressAmounts}>
            {formatAed(deal.paidToDateAed)} of {formatAed(deal.totalValueAed)}
          </p>
        </section>

        {deal.nextMilestone ? (
          <section style={styles.nextCard}>
            <div>
              <p style={styles.nextEyebrow}>Next payment</p>
              <p style={styles.nextLabel}>
                {deal.nextMilestone.triggerLabel} · {formatDate(deal.nextMilestone.dueDate)}
              </p>
            </div>
            <span style={styles.nextAmount}>{formatAed(deal.nextMilestone.amountAed)}</span>
          </section>
        ) : null}

        <p style={styles.sectionHeading}>Payments</p>
        <section style={styles.card}>
          {deal.milestones.map((milestone, index) => (
            <div key={index} style={{ ...styles.milestoneRow, borderTop: index === 0 ? "none" : styles.milestoneRow.borderTop }}>
              <span style={milestone.status === "paid" ? styles.milestoneLabelPaid : styles.milestoneLabel}>
                {milestone.triggerLabel} · {milestone.label}
              </span>
              <span style={milestone.status === "paid" ? styles.milestoneAmountPaid : styles.milestoneAmount}>{formatAed(milestone.amountAed)}</span>
            </div>
          ))}
        </section>

        {deal.handoverEstimate ? <p style={styles.handoverNote}>Estimated handover: {formatDate(deal.handoverEstimate)}</p> : null}

        <p style={styles.footerNote}>Read-only view · figures provided by your broker</p>
      </div>
    </main>
  );
}

const JADE = "#0E6E5C";
const JADE_INK = "#0A2E2A";
const AMBER = "#E0922F";
const PAPER = "#F6F5F2";

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: PAPER,
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    color: "#16201E",
  },
  hero: {
    backgroundColor: JADE_INK,
    color: "#ECF3F0",
    padding: "32px 20px 44px",
  },
  brandRow: {
    marginBottom: 20,
  },
  brandMark: {
    fontWeight: 700,
    fontSize: 16,
    color: "#ECF3F0",
    letterSpacing: -0.2,
  },
  eyebrow: {
    fontSize: 12,
    textTransform: "uppercase" as const,
    letterSpacing: 0.6,
    color: "#9CD0C1",
    margin: 0,
  },
  projectName: {
    fontSize: 26,
    fontWeight: 700,
    margin: "6px 0 2px",
  },
  metaLine: {
    fontSize: 14,
    color: "#9CD0C1",
    margin: 0,
  },
  body: {
    maxWidth: 480,
    margin: "-24px auto 0",
    padding: "0 20px 48px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    border: "1px solid #E2DFD8",
    padding: 20,
  },
  progressRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 13,
    color: "#5A655F",
  },
  progressValue: {
    fontSize: 22,
    fontWeight: 700,
    color: JADE,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#EFEDE7",
    overflow: "hidden" as const,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: JADE,
  },
  progressAmounts: {
    fontSize: 13,
    color: "#5A655F",
    marginTop: 10,
    marginBottom: 0,
  },
  nextCard: {
    backgroundColor: "#FBEFD8",
    border: `1px solid ${AMBER}`,
    borderRadius: 18,
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextEyebrow: {
    fontSize: 11,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    color: "#8A5A12",
    margin: 0,
  },
  nextLabel: {
    fontSize: 15,
    fontWeight: 600,
    margin: "4px 0 0",
  },
  nextAmount: {
    fontSize: 17,
    fontWeight: 700,
  },
  sectionHeading: {
    fontSize: 12,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    color: "#5A655F",
    margin: "4px 0 0",
  },
  milestoneRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderTop: "1px solid #ECEAE3",
  },
  milestoneLabel: {
    fontSize: 14,
    color: "#16201E",
  },
  milestoneLabelPaid: {
    fontSize: 14,
    color: "#5A655F",
  },
  milestoneAmount: {
    fontSize: 14,
    fontWeight: 600,
  },
  milestoneAmountPaid: {
    fontSize: 14,
    fontWeight: 600,
    color: JADE,
  },
  handoverNote: {
    fontSize: 13,
    color: "#5A655F",
    textAlign: "center" as const,
  },
  footerNote: {
    fontSize: 11,
    color: "#8A938D",
    textAlign: "center" as const,
    marginTop: 4,
  },
  errorTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  errorBody: {
    fontSize: 14,
    color: "#5A655F",
  },
};
