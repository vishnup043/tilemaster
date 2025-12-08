import { Tile, Customer, Employee } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

// Storage keys for local fallback (Only used if Supabase is NOT configured)
const KEYS = {
  TILES: 'tilemaster_db_tiles_v1',
  CUSTOMERS: 'tilemaster_db_customers_v1',
  EMPLOYEES: 'tilemaster_db_employees_v1'
};

export const DB = {
  /**
   * Diagnostic: Check if tables exist
   */
  checkHealth: async (): Promise<'OK' | 'MISSING_TABLES' | 'ERROR'> => {
      if (!isSupabaseConfigured || !supabase) return 'ERROR';
      
      try {
        // Try to select 1 item from tiles to check if table exists
        const { error } = await supabase.from('tiles').select('id').limit(1);
        
        if (error) {
            // Check for Postgres error 42P01 (Undefined Table)
            if (error.code === '42P01') {
                return 'MISSING_TABLES';
            }
            
            // Check for specific error messages indicating missing tables
            // This handles cases where the error structure might differ
            const msg = error.message ? error.message.toLowerCase() : '';
            if (msg.includes('could not find the table') || msg.includes('does not exist') || msg.includes('relation "tiles" does not exist')) {
                return 'MISSING_TABLES';
            }
            
            console.error("DB Health Check Error:", JSON.stringify(error, null, 2));
            return 'ERROR';
        }
        
        return 'OK';
      } catch (e: any) {
          console.error("DB Health Check Exception:", e);
          return 'ERROR';
      }
  },

  /**
   * Loads inventory data.
   */
  loadTiles: async (defaultData: Tile[]): Promise<Tile[]> => {
    // STRICT MODE: If Supabase is configured, ONLY use Supabase.
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('tiles').select('*');
      
      if (error) {
        console.error("Supabase Load Error (Tiles):", error.message);
        // If error (e.g. table missing), return defaults but DO NOT fallback to local storage
        return defaultData;
      }

      if (data && data.length > 0) {
         return data.map((row: any) => ({ ...row.json_data, id: row.id }));
      }
      
      return defaultData;
    }
    
    // Legacy LocalStorage (Only if NO API Key provided)
    try {
      const stored = localStorage.getItem(KEYS.TILES);
      return stored ? JSON.parse(stored) : defaultData;
    } catch (e) {
      return defaultData;
    }
  },

  /**
   * Commits inventory changes.
   */
  saveTiles: async (data: Tile[]) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const rows = data.map(item => ({ id: item.id, json_data: item }));
        const currentIds = data.map(d => d.id);

        // 1. Upsert Modified/New Items
        if (rows.length > 0) {
            const { error } = await supabase.from('tiles').upsert(rows);
            if (error) throw error;
        }

        // 2. Delete Removed Items (Sync)
        if (currentIds.length > 0) {
            await supabase.from('tiles').delete().not('id', 'in', `(${currentIds.join(',')})`);
        } else {
            // If data is empty, clear table
            await supabase.from('tiles').delete().neq('id', '0');
        }
      } catch (e: any) {
        // Suppress logging if it's just a missing table error, as checkHealth handles that
        if (!e.message?.includes('Could not find the table')) {
            console.error("Supabase Save Error (Tiles):", e.message);
        }
      }
      return;
    }

    try {
      localStorage.setItem(KEYS.TILES, JSON.stringify(data));
    } catch (e) {
      console.error("Local Save Error", e);
    }
  },

  /**
   * Loads customer data.
   */
  loadCustomers: async (defaultData: Customer[]): Promise<Customer[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('customers').select('*');
      
      if (error) {
         console.error("Supabase Load Error (Customers):", error.message);
         return defaultData;
      }
      
      if (data && data.length > 0) {
         return data.map((row: any) => ({ ...row.json_data, id: row.id }));
      }
      return defaultData;
    }

    try {
      const stored = localStorage.getItem(KEYS.CUSTOMERS);
      return stored ? JSON.parse(stored) : defaultData;
    } catch (e) {
      return defaultData;
    }
  },

  /**
   * Commits customer changes.
   */
  saveCustomers: async (data: Customer[]) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const rows = data.map(item => ({ id: item.id, json_data: item }));
        const currentIds = data.map(d => d.id);

        if (rows.length > 0) {
            await supabase.from('customers').upsert(rows);
        }

        if (currentIds.length > 0) {
            await supabase.from('customers').delete().not('id', 'in', `(${currentIds.join(',')})`);
        } else {
            await supabase.from('customers').delete().neq('id', '0');
        }
      } catch (e: any) {
          if (!e.message?.includes('Could not find the table')) {
             console.error("Supabase Save Error (Customers):", e.message);
          }
      }
      return;
    }

    try {
      localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(data));
    } catch (e) {
      console.error("Local Save Error", e);
    }
  },

  /**
   * Loads employee/user data.
   */
  loadEmployees: async (defaultData: Employee[]): Promise<Employee[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('employees').select('*');
      
      if (error) {
        console.error("Supabase Load Error (Employees):", error.message);
        return defaultData;
      }

      if (data && data.length > 0) {
        return data.map((row: any) => ({ ...row.json_data, id: row.id }));
      }
      return defaultData;
    }

    try {
      const stored = localStorage.getItem(KEYS.EMPLOYEES);
      return stored ? JSON.parse(stored) : defaultData;
    } catch (e) {
      return defaultData;
    }
  },

  /**
   * Commits employee changes.
   */
  saveEmployees: async (data: Employee[]) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const rows = data.map(item => ({ id: item.id, json_data: item }));
        const currentIds = data.map(d => d.id);

        if (rows.length > 0) {
            await supabase.from('employees').upsert(rows);
        }

        if (currentIds.length > 0) {
            await supabase.from('employees').delete().not('id', 'in', `(${currentIds.join(',')})`);
        } else {
            await supabase.from('employees').delete().neq('id', '0');
        }
      } catch (e: any) {
          if (!e.message?.includes('Could not find the table')) {
            console.error("Supabase Save Error (Employees):", e.message);
          }
      }
      return;
    }

    try {
      localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(data));
    } catch (e) {
      console.error("Local Save Error", e);
    }
  },

  /**
   * Utility to clear the database (Factory Reset)
   */
  clear: async () => {
    if (isSupabaseConfigured && supabase) {
        try {
            await supabase.from('tiles').delete().neq('id', '0');
            await supabase.from('customers').delete().neq('id', '0');
            await supabase.from('employees').delete().neq('id', '0');
        } catch(e) {
            console.error("Clear DB Error", e);
        }
    }
    // Also clear local just in case
    localStorage.removeItem(KEYS.TILES);
    localStorage.removeItem(KEYS.CUSTOMERS);
    localStorage.removeItem(KEYS.EMPLOYEES);
    window.location.reload();
  }
};