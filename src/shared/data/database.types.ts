export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type DealStatus = "active" | "completed" | "cancelled";
export type MilestoneStatus = "paid" | "due" | "upcoming" | "overdue";
export type MilestoneSource = "manual" | "spa_extracted";
export type MilestoneTrigger = "booking" | "registration" | "construction" | "handover";
export type ReminderChannel = "push" | "email";
export type ReminderStatus = "pending" | "sent" | "failed" | "cancelled";

export type Database = {
  public: {
    Tables: {
      orgs: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          name?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          org_id: string;
          full_name: string | null;
          email: string;
          role: string | null;
          onboarding_complete: boolean;
          persona: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          org_id: string;
          full_name?: string | null;
          email: string;
          role?: string | null;
          onboarding_complete?: boolean;
          persona?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          role?: string | null;
          onboarding_complete?: boolean;
          persona?: Json;
          updated_at?: string;
        };
      };
      developers: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          name?: string;
        };
      };
      deals: {
        Row: {
          id: string;
          org_id: string;
          created_by: string;
          developer_id: string | null;
          project_name: string;
          unit: string;
          buyer_name: string;
          buyer_email: string | null;
          total_value_aed: string;
          spa_number: string | null;
          handover_estimate: string | null;
          status: DealStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          created_by: string;
          developer_id?: string | null;
          project_name: string;
          unit: string;
          buyer_name: string;
          buyer_email?: string | null;
          total_value_aed: string;
          spa_number?: string | null;
          handover_estimate?: string | null;
          status?: DealStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          developer_id?: string | null;
          project_name?: string;
          unit?: string;
          buyer_name?: string;
          buyer_email?: string | null;
          total_value_aed?: string;
          spa_number?: string | null;
          handover_estimate?: string | null;
          status?: DealStatus;
          updated_at?: string;
        };
      };
      milestones: {
        Row: {
          id: string;
          deal_id: string;
          org_id: string;
          seq: number;
          label: string;
          trigger_type: MilestoneTrigger;
          trigger_value: string | null;
          percent: string;
          amount_aed: string;
          due_date: string | null;
          paid_date: string | null;
          status: MilestoneStatus;
          source: MilestoneSource;
        };
        Insert: {
          id?: string;
          deal_id: string;
          org_id: string;
          seq: number;
          label: string;
          trigger_type: MilestoneTrigger;
          trigger_value?: string | null;
          percent: string;
          amount_aed: string;
          due_date?: string | null;
          paid_date?: string | null;
          status: MilestoneStatus;
          source?: MilestoneSource;
        };
        Update: {
          seq?: number;
          label?: string;
          trigger_type?: MilestoneTrigger;
          trigger_value?: string | null;
          percent?: string;
          amount_aed?: string;
          due_date?: string | null;
          paid_date?: string | null;
          status?: MilestoneStatus;
          source?: MilestoneSource;
        };
      };
      documents: {
        Row: {
          id: string;
          deal_id: string;
          org_id: string;
          name: string;
          storage_path: string;
          kind: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          deal_id: string;
          org_id: string;
          name: string;
          storage_path: string;
          kind: string;
          uploaded_at?: string;
        };
        Update: {
          name?: string;
          kind?: string;
        };
      };
      reminders: {
        Row: {
          id: string;
          milestone_id: string;
          org_id: string;
          channel: ReminderChannel;
          send_at: string;
          sent_at: string | null;
          status: ReminderStatus;
        };
        Insert: {
          id?: string;
          milestone_id: string;
          org_id: string;
          channel: ReminderChannel;
          send_at: string;
          sent_at?: string | null;
          status?: ReminderStatus;
        };
        Update: {
          sent_at?: string | null;
          status?: ReminderStatus;
        };
      };
      push_tokens: {
        Row: {
          id: string;
          org_id: string;
          profile_id: string;
          token: string;
          platform: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          profile_id: string;
          token: string;
          platform?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          token?: string;
          platform?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_workspace_after_signup: {
        Args: {
          p_full_name: string;
          p_org_name: string;
          p_persona: Json;
          p_developer_names: string[];
        };
        Returns: Database["public"]["Tables"]["profiles"]["Row"];
      };
      save_onboarding_personalization: {
        Args: {
          p_role: string;
          p_market: string;
          p_volume: string;
          p_developer_names: string[];
        };
        Returns: Database["public"]["Tables"]["profiles"]["Row"];
      };
      complete_onboarding: {
        Args: Record<PropertyKey, never>;
        Returns: Database["public"]["Tables"]["profiles"]["Row"];
      };
      current_org_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      schedule_milestone_reminders: {
        Args: {
          p_milestone_id: string;
          p_offsets?: number[];
        };
        Returns: Database["public"]["Tables"]["reminders"]["Row"][];
      };
      schedule_due_milestone_reminders: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
