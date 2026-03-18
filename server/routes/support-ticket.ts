import { RequestHandler } from "express";
import type { SupportTicketRequest, SupportTicketResponse } from "@shared/api";
import { supabaseServer } from "../supabase";

const isMissingTableError = (error: { code?: string; message?: string } | null) =>
  Boolean(error && (error.code === "PGRST205" || /Could not find the table/i.test(error.message || "")));

export const handleCreateSupportTicket: RequestHandler = async (req, res) => {
  const { name, email, message, walletAddress } = req.body as SupportTicketRequest;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    const badRequest: SupportTicketResponse = {
      success: false,
      error: "Name, email, and message are required.",
    };
    return res.status(400).json(badRequest);
  }

  const { data, error } = await supabaseServer
    .from("support_tickets")
    .insert({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      wallet_address: walletAddress?.trim() || null,
    })
    .select("ticket_code, created_at")
    .single();

  if (error) {
    const failure: SupportTicketResponse = {
      success: false,
      error: isMissingTableError(error)
        ? "Supabase support_tickets table is missing. Run the SQL setup query in Supabase SQL Editor."
        : `Failed to create support ticket: ${error.message}`,
    };
    return res.status(500).json(failure);
  }

  const response: SupportTicketResponse = {
    success: true,
    ticketId: data?.ticket_code,
    createdAt: data?.created_at,
  };

  return res.status(201).json(response);
};
