"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { Message } from "@/components/message";
import { cardSurface, primaryButton, secondaryButton } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { publicPulseApi } from "@/services/api";
import { getStoredAuth, isOwnedReport } from "@/services/auth-storage";
import { ApiError, type ReportResponse, type ReportStatus } from "@/types/api";

const statusOptions: ReportStatus[] = [0, 1, 2];

type ReportDetailActionsProps = {
  report: ReportResponse;
};

export function ReportDetailActions({ report }: ReportDetailActionsProps) {
  const { getStatusLabel: getLocalizedStatusLabel, messages } = useI18n();
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
      setMessage(messages.reportActions.confirmed);
    } catch (caughtError) {
      setMessageTone("error");
      setMessage(
        caughtError instanceof ApiError
          ? caughtError.message
          : messages.reportActions.confirmError,
      );
    } finally {
      setIsConfirming(false);
    }
  }

  async function handleStatusChange(nextStatus: ReportStatus) {
    const auth = getStoredAuth();

    if (!auth) {
      setMessageTone("error");
      setMessage(messages.reportActions.loginToUpdate);
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
      setMessage(messages.reportActions.statusUpdated);
    } catch (caughtError) {
      setMessageTone("error");
      setMessage(
        caughtError instanceof ApiError
          ? caughtError.message
          : messages.reportActions.statusError,
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  return (
    <div className="grid gap-5">
      {message ? <Message tone={messageTone}>{message}</Message> : null}
      <div className={`${cardSurface} p-5`}>
        <div className="flex flex-col gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-bold text-[#39483f]">
              <Icon name="thumbs-up" size={16} />
              {messages.reportActions.confirmations}
            </p>
            <p className="mt-1 text-4xl font-black text-[#151d19]">
              {confirmationCount}
            </p>
          </div>
          <button
            className={primaryButton}
            type="button"
            disabled={isConfirming}
            onClick={handleConfirm}
          >
            <Icon name="thumbs-up" size={17} />
            {isConfirming
              ? messages.reportActions.confirming
              : messages.reportActions.confirmIssue}
          </button>
        </div>
      </div>
      {canUpdateStatus ? (
        <div className={`${cardSurface} p-5`}>
          <p className="inline-flex items-center gap-2 text-sm font-bold text-[#39483f]">
            <Icon name="check-circle" size={16} />
            {messages.reportActions.updateStatus}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                className={`${
                  status === option
                    ? primaryButton
                    : secondaryButton
                } disabled:cursor-not-allowed`}
                key={String(option)}
                type="button"
                disabled={isUpdatingStatus || status === option}
                onClick={() => handleStatusChange(option)}
              >
                <Icon
                  name={
                    option === 2
                      ? "check-circle"
                      : option === 1
                        ? "info"
                        : "file-text"
                  }
                  size={16}
                />
                {getLocalizedStatusLabel(option)}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
