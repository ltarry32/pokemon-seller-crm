// =============================================================
// SUPABASE DATABASE TYPES
// Auto-generated shape: run this to regenerate from your project:
//   npx supabase gen types typescript --project-id <your-project-id> \
//     --schema public > src/lib/supabase/database.types.ts
//
// These types are manually maintained to match supabase/schema.sql
// =============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id:            string
          full_name:     string | null
          email:         string | null
          business_name: string | null
          avatar_url:    string | null
          created_at:    string
          updated_at:    string
        }
        Insert: {
          id:            string
          full_name?:    string | null
          email?:        string | null
          business_name?: string | null
          avatar_url?:   string | null
          created_at?:   string
          updated_at?:   string
        }
        Update: {
          full_name?:    string | null
          email?:        string | null
          business_name?: string | null
          avatar_url?:   string | null
          updated_at?:   string
        }
      }
      inventory_items: {
        Row: {
          id:                   string
          user_id:              string
          card_name:            string
          set_name:             string
          card_number:          string | null
          rarity:               string | null
          language:             string
          condition:            string
          is_graded:            boolean
          grade:                string | null
          grading_company:      string | null
          quantity:             number
          cost_basis:           number
          current_market_price: number
          list_price:           number | null
          min_price:            number | null
          storage_location:     string | null
          status:               string
          source:               string | null
          purchase_date:        string | null
          notes:                string | null
          image_url:            string | null
          created_at:           string
          updated_at:           string
        }
        Insert: {
          id?:                  string
          user_id:              string
          card_name:            string
          set_name:             string
          card_number?:         string | null
          rarity?:              string | null
          language?:            string
          condition:            string
          is_graded?:           boolean
          grade?:               string | null
          grading_company?:     string | null
          quantity?:            number
          cost_basis?:          number
          current_market_price?: number
          list_price?:          number | null
          min_price?:           number | null
          storage_location?:    string | null
          status?:              string
          source?:              string | null
          purchase_date?:       string | null
          notes?:               string | null
          image_url?:           string | null
          created_at?:          string
          updated_at?:          string
        }
        Update: {
          card_name?:            string
          set_name?:             string
          card_number?:          string | null
          rarity?:               string | null
          language?:             string
          condition?:            string
          is_graded?:            boolean
          grade?:                string | null
          grading_company?:      string | null
          quantity?:             number
          cost_basis?:           number
          current_market_price?: number
          list_price?:           number | null
          min_price?:            number | null
          storage_location?:     string | null
          status?:               string
          source?:               string | null
          purchase_date?:        string | null
          notes?:                string | null
          image_url?:            string | null
          updated_at?:           string
        }
      }
      price_snapshots: {
        Row: {
          id:                 string
          inventory_item_id:  string | null
          source:             string | null
          low_price:          number | null
          avg_price:          number | null
          high_price:         number | null
          sold_average:       number | null
          sales_count:        number
          captured_at:        string
        }
        Insert: {
          id?:                string
          inventory_item_id?: string | null
          source?:            string | null
          low_price?:         number | null
          avg_price?:         number | null
          high_price?:        number | null
          sold_average?:      number | null
          sales_count?:       number
          captured_at?:       string
        }
        Update: {
          source?:       string | null
          low_price?:    number | null
          avg_price?:    number | null
          high_price?:   number | null
          sold_average?: number | null
          sales_count?:  number
          captured_at?:  string
        }
      }
      sold_transactions: {
        Row: {
          id:                  string
          user_id:             string
          inventory_item_id:   string | null
          card_name:           string
          set_name:            string | null
          card_number:         string | null
          condition:           string | null
          is_graded:           boolean
          grade:               string | null
          image_url:           string | null
          sold_price:          number
          platform:            string | null
          buyer_name:          string | null
          fees:                number
          shipping_cost:       number
          packaging_cost:      number
          cost_basis:          number
          net_profit:          number | null
          payment_method:      string | null
          tracking_number:     string | null
          date_sold:           string
          notes:               string | null
          created_at:          string
        }
        Insert: {
          id?:                 string
          user_id:             string
          inventory_item_id?:  string | null
          card_name:           string
          set_name?:           string | null
          card_number?:        string | null
          condition?:          string | null
          is_graded?:          boolean
          grade?:              string | null
          image_url?:          string | null
          sold_price:          number
          platform?:           string | null
          buyer_name?:         string | null
          fees?:               number
          shipping_cost?:      number
          packaging_cost?:     number
          cost_basis?:         number
          net_profit?:         number | null
          payment_method?:     string | null
          tracking_number?:    string | null
          date_sold?:          string
          notes?:              string | null
          created_at?:         string
        }
        Update: {
          sold_price?:      number
          platform?:        string | null
          buyer_name?:      string | null
          fees?:            number
          shipping_cost?:   number
          packaging_cost?:  number
          cost_basis?:      number
          net_profit?:      number | null
          payment_method?:  string | null
          tracking_number?: string | null
          date_sold?:       string
          notes?:           string | null
        }
      }
      fee_profiles: {
        Row: {
          id:                 string
          user_id:            string
          name:               string
          platform:           string | null
          fee_percent:        number
          processing_percent: number
          fixed_fee:          number
          created_at:         string
        }
        Insert: {
          id?:                string
          user_id:            string
          name:               string
          platform?:          string | null
          fee_percent?:       number
          processing_percent?: number
          fixed_fee?:         number
          created_at?:        string
        }
        Update: {
          name?:               string
          platform?:           string | null
          fee_percent?:        number
          processing_percent?: number
          fixed_fee?:          number
        }
      }
      integrations: {
        Row: {
          id:                   string
          user_id:              string
          provider:             string
          is_connected:         boolean
          api_key_placeholder:  string | null
          display_name:         string | null
          created_at:           string
          updated_at:           string
        }
        Insert: {
          id?:                  string
          user_id:              string
          provider:             string
          is_connected?:        boolean
          api_key_placeholder?: string | null
          display_name?:        string | null
          created_at?:          string
          updated_at?:          string
        }
        Update: {
          is_connected?:        boolean
          api_key_placeholder?: string | null
          display_name?:        string | null
          updated_at?:          string
        }
      }
      scan_history: {
        Row: {
          id:               string
          user_id:          string
          scan_type:        string | null
          raw_scan_data:    string | null
          identified_name:  string | null
          identified_set:   string | null
          identified_number: string | null
          confidence_score: number | null
          created_at:       string
        }
        Insert: {
          id?:               string
          user_id:           string
          scan_type?:        string | null
          raw_scan_data?:    string | null
          identified_name?:  string | null
          identified_set?:   string | null
          identified_number?: string | null
          confidence_score?: number | null
          created_at?:       string
        }
        Update: never
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// ─── Convenience row types ────────────────────────────────────

export type ProfileRow         = Database['public']['Tables']['profiles']['Row']
export type InventoryItemRow   = Database['public']['Tables']['inventory_items']['Row']
export type PriceSnapshotRow   = Database['public']['Tables']['price_snapshots']['Row']
export type SoldTransactionRow = Database['public']['Tables']['sold_transactions']['Row']
export type FeeProfileRow      = Database['public']['Tables']['fee_profiles']['Row']
export type IntegrationRow     = Database['public']['Tables']['integrations']['Row']
export type ScanHistoryRow     = Database['public']['Tables']['scan_history']['Row']
