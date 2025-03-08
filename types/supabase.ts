export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string | null;
          role: "ADMIN" | "USER";
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: "ADMIN" | "USER";
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: "ADMIN" | "USER";
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
