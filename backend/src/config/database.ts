/**
 * Database Configuration with Connection Pooling
 * Optimizes database connections for better performance
 */

export const databaseConfig = {
  // Connection pool settings for Supabase/PostgreSQL
  pool: {
    min: 2,                    // Minimum pool size
    max: 10,                   // Maximum pool size
    idleTimeoutMillis: 30000,  // Close idle clients after 30s
    connectionTimeoutMillis: 2000, // Return error after 2s if connection can't be established
    maxUses: 7500,             // Close connection after 7500 uses
  },

  // Query timeout
  statement_timeout: 10000,    // 10 seconds max per query

  // Connection retry settings
  retry: {
    attempts: 3,
    delay: 1000,               // 1 second between retries
    backoff: 2,                // Exponential backoff multiplier
  },

  // Performance settings
  performance: {
    enableQueryLogging: process.env.NODE_ENV === 'development',
    slowQueryThreshold: 1000,  // Log queries slower than 1s
    enablePreparedStatements: true,
  },
};

/**
 * Example Supabase client configuration with pooling
 */
export const getSupabaseConfig = () => ({
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'petflix-backend',
    },
  },
  // Connection pooling (handled by Supabase, but can be configured)
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Health check for database connection
 */
export const checkDatabaseHealth = async (supabase: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    return !error;
  } catch {
    return false;
  }
};

