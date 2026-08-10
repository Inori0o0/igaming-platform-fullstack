export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4";
  };
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_type: string;
          id: string;
          unlocked_at: string | null;
          user_id: string;
        };
        Insert: {
          achievement_type: string;
          id?: string;
          unlocked_at?: string | null;
          user_id: string;
        };
        Update: {
          achievement_type?: string;
          id?: string;
          unlocked_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      coupons: {
        Row: {
          applies_fulfillment: string;
          code: string;
          created_at: string;
          deleted_at: string | null;
          discount_type: Database["public"]["Enums"]["coupon_discount_type"];
          discount_value: number;
          expires_at: string | null;
          id: string;
          internal_note: string | null;
          is_active: boolean | null;
          min_purchase: number | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          applies_fulfillment?: string;
          code: string;
          created_at?: string;
          deleted_at?: string | null;
          discount_type: Database["public"]["Enums"]["coupon_discount_type"];
          discount_value: number;
          expires_at?: string | null;
          id?: string;
          internal_note?: string | null;
          is_active?: boolean | null;
          min_purchase?: number | null;
          title?: string;
          updated_at?: string;
        };
        Update: {
          applies_fulfillment?: string;
          code?: string;
          created_at?: string;
          deleted_at?: string | null;
          discount_type?: Database["public"]["Enums"]["coupon_discount_type"];
          discount_value?: number;
          expires_at?: string | null;
          id?: string;
          internal_note?: string | null;
          is_active?: boolean | null;
          min_purchase?: number | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      game_history: {
        Row: {
          bet_amount: number | null;
          game_type: string;
          id: string;
          played_at: string | null;
          result: Json | null;
          user_id: string;
          win_amount: number | null;
        };
        Insert: {
          bet_amount?: number | null;
          game_type: string;
          id?: string;
          played_at?: string | null;
          result?: Json | null;
          user_id: string;
          win_amount?: number | null;
        };
        Update: {
          bet_amount?: number | null;
          game_type?: string;
          id?: string;
          played_at?: string | null;
          result?: Json | null;
          user_id?: string;
          win_amount?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "game_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          created_at: string | null;
          id: string;
          line_total_vac: number | null;
          order_id: string;
          price_at_purchase: number;
          product_id: string;
          quantity: number;
          size_snapshot: string | null;
          unit_price_vac: number | null;
          variant_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          line_total_vac?: number | null;
          order_id: string;
          price_at_purchase: number;
          product_id: string;
          quantity?: number;
          size_snapshot?: string | null;
          unit_price_vac?: number | null;
          variant_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          line_total_vac?: number | null;
          order_id?: string;
          price_at_purchase?: number;
          product_id?: string;
          quantity?: number;
          size_snapshot?: string | null;
          unit_price_vac?: number | null;
          variant_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          coupon_code: string | null;
          created_at: string | null;
          discount_vac: number | null;
          fulfillment_type: string | null;
          id: string;
          shipping_fee_vac: number | null;
          shipping_info: Json | null;
          shipping_snapshot: Json | null;
          status: Database["public"]["Enums"]["order_status"] | null;
          subtotal_vac: number | null;
          total_amount: number;
          total_vac: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          coupon_code?: string | null;
          created_at?: string | null;
          discount_vac?: number | null;
          fulfillment_type?: string | null;
          id?: string;
          shipping_fee_vac?: number | null;
          shipping_info?: Json | null;
          shipping_snapshot?: Json | null;
          status?: Database["public"]["Enums"]["order_status"] | null;
          subtotal_vac?: number | null;
          total_amount: number;
          total_vac?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          coupon_code?: string | null;
          created_at?: string | null;
          discount_vac?: number | null;
          fulfillment_type?: string | null;
          id?: string;
          shipping_fee_vac?: number | null;
          shipping_info?: Json | null;
          shipping_snapshot?: Json | null;
          status?: Database["public"]["Enums"]["order_status"] | null;
          subtotal_vac?: number | null;
          total_amount?: number;
          total_vac?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          created_at: string;
          id: string;
          product_id: string;
          size: string | null;
          stock_quantity: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          product_id: string;
          size?: string | null;
          stock_quantity?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          product_id?: string;
          size?: string | null;
          stock_quantity?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          category: string | null;
          created_at: string | null;
          description: string | null;
          force_sold_out: boolean | null;
          fulfillment_type: string | null;
          id: string;
          image_bucket: string | null;
          image_object_path: string | null;
          image_url: string | null;
          is_active: boolean | null;
          is_avatar: boolean | null;
          name: string;
          price: number;
          price_vac: number | null;
          slug: string | null;
          sort_order: number;
          stock: number | null;
          updated_at: string | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          force_sold_out?: boolean | null;
          fulfillment_type?: string | null;
          id?: string;
          image_bucket?: string | null;
          image_object_path?: string | null;
          image_url?: string | null;
          is_active?: boolean | null;
          is_avatar?: boolean | null;
          name: string;
          price: number;
          price_vac?: number | null;
          slug?: string | null;
          sort_order?: number;
          stock?: number | null;
          updated_at?: string | null;
        };
        Update: {
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          force_sold_out?: boolean | null;
          fulfillment_type?: string | null;
          id?: string;
          image_bucket?: string | null;
          image_object_path?: string | null;
          image_url?: string | null;
          is_active?: boolean | null;
          is_avatar?: boolean | null;
          name?: string;
          price?: number;
          price_vac?: number | null;
          slug?: string | null;
          sort_order?: number;
          stock?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          amount: number;
          balance_after: number | null;
          created_at: string | null;
          currency: string;
          description: string | null;
          game_id: string | null;
          id: string;
          metadata: Json | null;
          round_id: string | null;
          status: string;
          theme_id: string | null;
          type: Database["public"]["Enums"]["transaction_type"];
          user_id: string;
        };
        Insert: {
          amount: number;
          balance_after?: number | null;
          created_at?: string | null;
          currency: string;
          description?: string | null;
          game_id?: string | null;
          id?: string;
          metadata?: Json | null;
          round_id?: string | null;
          status?: string;
          theme_id?: string | null;
          type: Database["public"]["Enums"]["transaction_type"];
          user_id: string;
        };
        Update: {
          amount?: number;
          balance_after?: number | null;
          created_at?: string | null;
          currency?: string;
          description?: string | null;
          game_id?: string | null;
          id?: string;
          metadata?: Json | null;
          round_id?: string | null;
          status?: string;
          theme_id?: string | null;
          type?: Database["public"]["Enums"]["transaction_type"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_avatar_selection: {
        Row: {
          avatar_product_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          avatar_product_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar_product_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_avatar_selection_avatar_product_id_fkey";
            columns: ["avatar_product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_avatar_selection_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_entitlements: {
        Row: {
          entitlement_type: string;
          granted_at: string;
          id: string;
          product_id: string;
          source_order_id: string | null;
          user_id: string;
        };
        Insert: {
          entitlement_type: string;
          granted_at?: string;
          id?: string;
          product_id: string;
          source_order_id?: string | null;
          user_id: string;
        };
        Update: {
          entitlement_type?: string;
          granted_at?: string;
          id?: string;
          product_id?: string;
          source_order_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_entitlements_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_entitlements_source_order_id_fkey";
            columns: ["source_order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_entitlements_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          auth_user_id: string | null;
          avatar_url: string | null;
          banned_at: string | null;
          created_at: string | null;
          display_name: string | null;
          email: string | null;
          id: string;
          is_guest: boolean | null;
        };
        Insert: {
          auth_user_id?: string | null;
          avatar_url?: string | null;
          banned_at?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          email?: string | null;
          id?: string;
          is_guest?: boolean | null;
        };
        Update: {
          auth_user_id?: string | null;
          avatar_url?: string | null;
          banned_at?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          email?: string | null;
          id?: string;
          is_guest?: boolean | null;
        };
        Relationships: [];
      };
      wallets: {
        Row: {
          btc_balance: number | null;
          coin_balance: number | null;
          eth_balance: number | null;
          id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          btc_balance?: number | null;
          coin_balance?: number | null;
          eth_balance?: number | null;
          id?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          btc_balance?: number | null;
          coin_balance?: number | null;
          eth_balance?: number | null;
          id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      wishlists: {
        Row: {
          created_at: string | null;
          id: string;
          product_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          product_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          product_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wishlists_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      adjust_wallet_balance: {
        Args: {
          p_delta: number;
          p_description?: string;
          p_game_id?: string;
          p_metadata?: Json;
          p_round_id?: string;
          p_theme_id?: string;
          p_type: Database["public"]["Enums"]["transaction_type"];
        };
        Returns: Json;
      };
      admin_search_orders: {
        Args: {
          p_limit?: number;
          p_offset?: number;
          p_search?: string;
          p_status?: string;
        };
        Returns: {
          coupon_code: string;
          created_at: string;
          discount_vac: number;
          fulfillment_type: string;
          id: string;
          shipping_fee_vac: number;
          shipping_info: Json;
          shipping_snapshot: Json;
          status: Database["public"]["Enums"]["order_status"];
          subtotal_vac: number;
          total_amount: number;
          total_count: number;
          total_vac: number;
          updated_at: string;
          user_id: string;
        }[];
      };
      admin_search_transactions: {
        Args: {
          p_amount_max?: number;
          p_amount_min?: number;
          p_date_from?: string;
          p_date_to?: string;
          p_limit?: number;
          p_offset?: number;
          p_search?: string;
          p_status?: string;
          p_type?: string;
        };
        Returns: {
          amount: number;
          balance_after: number;
          created_at: string;
          currency: string;
          description: string;
          game_id: string;
          id: string;
          metadata: Json;
          round_id: string;
          status: string;
          theme_id: string;
          total_count: number;
          type: Database["public"]["Enums"]["transaction_type"];
          user_id: string;
        }[];
      };
      checkout_shop_order: {
        Args: { p_coupon_code?: string; p_lines: Json; p_shipping?: Json };
        Returns: Json;
      };
      claim_free_coins: { Args: Record<PropertyKey, never>; Returns: Json };
      deposit_wallet: { Args: { p_amount: number }; Returns: Json };
      ensure_wallet: {
        Args: Record<PropertyKey, never>;
        Returns: {
          btc_balance: number | null;
          coin_balance: number | null;
          eth_balance: number | null;
          id: string;
          updated_at: string | null;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "wallets";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      get_admin_dashboard_stats: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
    };
    Enums: {
      coupon_discount_type: "percentage" | "fixed" | "free_shipping";
      order_status: "pending" | "paid" | "shipped" | "completed" | "cancelled";
      transaction_type:
        | "deposit"
        | "withdraw"
        | "bet"
        | "win"
        | "purchase"
        | "claim"
        | "wager"
        | "payout";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      coupon_discount_type: ["percentage", "fixed", "free_shipping"],
      order_status: ["pending", "paid", "shipped", "completed", "cancelled"],
      transaction_type: [
        "deposit",
        "withdraw",
        "bet",
        "win",
        "purchase",
        "claim",
        "wager",
        "payout",
      ],
    },
  },
} as const;
