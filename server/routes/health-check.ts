import { RequestHandler } from "express";
import { supabaseServer } from "../supabase";

export const handleHealthCheck: RequestHandler = async (req, res) => {
  try {
    // Test Supabase connection by querying the auth admin
    const { data, error } = await supabaseServer.auth.admin.listUsers();

    if (error) {
      return res.status(500).json({
        success: false,
        error: `Supabase connection failed: ${error.message}`,
        details: error,
      });
    }

    // Connection successful
    res.status(200).json({
      success: true,
      message: "✅ Supabase database connected successfully",
      timestamp: new Date().toISOString(),
      database: {
        url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "Not configured",
        status: "Connected",
      },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({
      success: false,
      error: `Connection test failed: ${errorMessage}`,
    });
  }
};
