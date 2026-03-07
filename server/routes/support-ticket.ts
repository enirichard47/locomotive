import { RequestHandler } from "express";
import type { SupportTicketRequest, SupportTicketResponse } from "@shared/api";

interface StoredSupportTicket extends SupportTicketRequest {
  id: string;
  createdAt: string;
}

const supportTickets: StoredSupportTicket[] = [];

export const handleCreateSupportTicket: RequestHandler = (req, res) => {
  const { name, email, message, walletAddress } = req.body as SupportTicketRequest;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    const badRequest: SupportTicketResponse = {
      success: false,
      error: "Name, email, and message are required.",
    };
    return res.status(400).json(badRequest);
  }

  const ticket: StoredSupportTicket = {
    id: `TKT-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    walletAddress: walletAddress?.trim(),
  };

  supportTickets.unshift(ticket);

  const response: SupportTicketResponse = {
    success: true,
    ticketId: ticket.id,
    createdAt: ticket.createdAt,
  };

  return res.status(201).json(response);
};
