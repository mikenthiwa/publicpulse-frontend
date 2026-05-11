"use client";

import { useEffect, useState } from "react";
import { Message } from "@/components/message";
import { getStatusLabel } from "@/components/report-status";
import { publicPulseApi } from "@/services/api";
import { getStoredAuth, isOwnedReport } from "@/services/auth-storage";
import { ApiError, type ReportResponse, type ReportStatus } from "@/types/api";

const statusOptions: ReportStatus[] = [0, 1, 2];

type ReportDetailActionsProps = {
  report: ReportResponse;
};

export function ReportDetailActions({ report }: ReportDetailActionsProps) {
  const [confirmationCount, setConfirmationCount] = useState(report.confirmationCount);
  const [status, setStatus] = useState<ReportStatus>(report.status);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success">("success");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [canUpdateStatus, setCanUpdateStatus] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const auth = getStoredAuth();
      setCanUpdateStatus(auth ? isOwnedReport(auth.userId, report.id) : false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [report.id]);

  async function handleConfirm() {
    setMessage("");
    setIsConfirming(true);

    try {
      const confirmation = await publicPulseApi.confirmReport(report.id);
      setConfirmationCount(confirmation.confirmationCount);
      setMessageTone("success");
      setMessage("Report confirmed.");
    } catch (caughtError) {
      setMessageTone("error");
      setMessage(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to confirm the report.",
      );
    } finally {
      setIsConfirming(false);
    }
  }

  async function handleStatusChange(nextStatus: ReportStatus) {
    const auth = getStoredAuth();

    if (!auth) {
      setMessageTone("error");
      setMessage("Log in to update report status.");
      setCanUpdateStatus(false);
      return;
    }

    setMessage("");
    setIsUpdatingStatus(true);

    try {
      const updatedReport = await publicPulseApi.updateReportStatus(
        report.id,
        nextStatus,
        auth.token,
      );
      setStatus(updatedReport.status);
      setMessageTone("success");
      setMessage("Report status updated.");
    } catch (caughtError) {
      setMessageTone("error");
      setMessage(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to update report status.",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  return (
    <div className="grid gap-5">
      {message ? <Message tone={messageTone}>{message}</Message> : null}
      <div className="rounded-md border border-[#d6ded3] bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#405246]">Confirmations</p>
            <p className="mt-1 text-3xl font-semibold text-[#172019]">{confirmationCount}</p>
          </div>
          <button
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#1f6f4a] px-5 text-sm font-semibold text-white transition hover:bg-[#185a3c] disabled:cursor-not-allowed disabled:bg-[#8caf9a]"
            type="button"
            disabled={isConfirming}
            onClick={handleConfirm}
          >
            {isConfirming ? "Confirming..." : "Confirm issue"}
          </button>
        </div>
      </div>
      {canUpdateStatus ? (
        <div className="rounded-md border border-[#d6ded3] bg-white p-5">
          <p className="text-sm font-semibold text-[#405246]">Update status</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                className={`inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-semibold transition disabled:cursor-not-allowed ${
                  status === option
                    ? "border-[#1f6f4a] bg-[#1f6f4a] text-white"
                    : "border-[#b7c7bb] text-[#26352b] hover:bg-[#f7f8f4]"
                }`}
                key={String(option)}
                type="button"
                disabled={isUpdatingStatus || status === option}
                onClick={() => handleStatusChange(option)}
              >
                {getStatusLabel(option)}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
