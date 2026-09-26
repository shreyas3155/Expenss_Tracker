"use client";

import React, { useState } from "react";
import { X, Copy, Check, Code2, Sparkles, Terminal, FileSpreadsheet, Send } from "lucide-react";

interface GoogleAppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAppsScriptModal: React.FC<GoogleAppsScriptModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const scriptCode = `/**
 * Spendly — Automated Bank Email Parser with Gemini AI
 * 1. Checks Gmail every 1 minute for bank payment alerts
 * 2. Parses merchant & category using Gemini AI
 * 3. Appends row to Google Sheet (10 columns)
 * 4. Pushes real-time transaction to your Vercel Dashboard webhook!
 */

const CONFIG = {
  GEMINI_API_KEY: "YOUR_GEMINI_API_KEY_HERE",
  VERCEL_WEBHOOK_URL: "https://your-spendly-domain.vercel.app/api/webhook", // Replace with your Vercel URL
  SHEET_NAME: "Sheet1",
  SEARCH_QUERY: 'is:unread (from:hdfcbank.net OR from:alerts@sbi.co.in OR from:icicibank.com OR subject:"debited" OR subject:"credited" OR subject:"UPI")'
};

function autoProcessBankEmails() {
  const threads = GmailApp.search(CONFIG.SEARCH_QUERY, 0, 10);
  if (!threads || threads.length === 0) return;

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME) || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  threads.forEach(thread => {
    const messages = thread.getMessages();
    messages.forEach(msg => {
      if (!msg.isUnread()) return;

      const body = msg.getPlainBody() || msg.getBody();
      const subject = msg.getSubject();
      const date = msg.getDate();
      const messageId = msg.getId();

      // Step 1: Send to Gemini AI to extract 10-column data
      const parsedData = parseEmailWithGemini(subject + "\\n" + body, date, messageId);

      if (parsedData && parsedData.amount > 0) {
        // Step 2: Append 10 columns into Google Sheet
        sheet.appendRow([
          parsedData.date,               // Column 1: Date
          parsedData.payee,              // Column 2: Payee / Description
          parsedData.amount,             // Column 3: Amount
          parsedData.category,           // Column 4: Category
          parsedData.referenceNo,        // Column 5: Reference No. / UTR
          parsedData.notes,              // Column 6: Notes
          parsedData.bankNotification,   // Column 7: Bank Notification / Details
          parsedData.messageId,          // Column 8: Message ID
          parsedData.type,               // Column 9: Type (Credit / Debit)
          parsedData.source              // Column 10: Source / Method
        ]);

        // Step 3: Push in real-time to your Vercel Website!
        sendToVercelWebhook(parsedData);

        // Mark as read to avoid duplicate processing
        msg.markRead();
      }
    });
  });
}

function parseEmailWithGemini(emailContent, emailDate, messageId) {
  const prompt = \`
You are an expert Indian bank alert email parser. Extract transactional financial information from the email below and return ONLY valid JSON matching this schema:
{
  "date": "YYYY-MM-DD HH:MM AM/PM",
  "payee": "Merchant or Beneficiary name (e.g. Swiggy, Uber, Client Name)",
  "amount": 450.00 (numeric only),
  "category": "One of: Food & Dining, Transport, Shopping, Groceries, Utilities, Entertainment, Salary & Income, Investments, Other",
  "referenceNo": "UPI Reference number, UTR, or Transaction ID",
  "notes": "Short description of expense or transfer",
  "bankNotification": "First 250 characters of bank notification",
  "messageId": "\${messageId}",
  "type": "Debit" or "Credit",
  "source": "Bank and payment method (e.g. HDFC Bank UPI, Google Pay, NetBanking, Debit Card)"
}

Email Content:
\${emailContent}
\`;

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + CONFIG.GEMINI_API_KEY;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const res = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(res.getContentText());
    const rawText = json.candidates[0].content.parts[0].text;
    return JSON.parse(rawText);
  } catch (err) {
    Logger.log("Gemini parse error: " + err);
    return null;
  }
}

function sendToVercelWebhook(transaction) {
  if (!CONFIG.VERCEL_WEBHOOK_URL || CONFIG.VERCEL_WEBHOOK_URL.includes("your-spendly-domain")) return;

  try {
    UrlFetchApp.fetch(CONFIG.VERCEL_WEBHOOK_URL, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(transaction),
      muteHttpExceptions: true
    });
  } catch (e) {
    Logger.log("Vercel webhook error: " + e);
  }
}
`;

  const copyScript = () => {
    navigator.clipboard?.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl max-h-[92vh] bg-[#F6F3EB] rounded-[32px] p-6 shadow-2xl border border-black/10 flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#1A1A1A] text-[#F5D547] flex items-center justify-center shadow-xs">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#1A1A1A]">
                Google Apps Script & Gemini AI Setup
              </h2>
              <p className="text-xs text-black/50">
                Automate Gmail → Gemini AI → Google Sheet → Vercel Webhook in 3 steps
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/60 hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Step Instruction Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-3">
          <div className="bg-white p-3 rounded-2xl border border-black/5 shadow-2xs">
            <span className="text-[10px] font-bold text-black/40 uppercase">Step 1</span>
            <p className="text-xs font-bold text-[#1A1A1A]">Open script.google.com</p>
            <p className="text-[11px] text-black/50">Inside your Google Sheet: Extensions → Apps Script</p>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-black/5 shadow-2xs">
            <span className="text-[10px] font-bold text-black/40 uppercase">Step 2</span>
            <p className="text-xs font-bold text-[#1A1A1A]">Paste Script & API Key</p>
            <p className="text-[11px] text-black/50">Add Gemini API key & your Vercel deployment URL</p>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-black/5 shadow-2xs">
            <span className="text-[10px] font-bold text-black/40 uppercase">Step 3</span>
            <p className="text-xs font-bold text-[#1A1A1A]">Set 1-Min Trigger</p>
            <p className="text-[11px] text-black/50">Triggers → Add Trigger → autoProcessBankEmails → Every minute</p>
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[#1A1A1A] rounded-2xl border border-black/10 shadow-inner my-2">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/40">
            <span className="text-xs font-mono text-white/70">
              Code.gs (Google Apps Script)
            </span>
            <button
              onClick={copyScript}
              className="flex items-center gap-1.5 bg-[#F5D547] hover:bg-[#ebd043] text-[#1A1A1A] px-3 py-1 rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-800" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <pre className="flex-1 overflow-y-auto p-4 text-[11px] font-mono text-white/80 leading-relaxed select-all">
            {scriptCode}
          </pre>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs">
          <span className="text-black/50">
            Webhook ready at: <code className="font-mono text-black font-semibold">/api/webhook</code>
          </span>
          <button
            onClick={onClose}
            className="bg-[#1A1A1A] hover:bg-black text-white px-5 py-2 rounded-full font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
