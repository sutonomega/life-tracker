"use client";

import { useEffect, useMemo, useState } from "react";

type TemplateItem = {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  memo: string | null;
  category: {
    name: string;
    color: string;
  };
};

type ScheduleTemplate = {
  id: number;
  name: string;
  items: TemplateItem[];
};

type ScheduleTemplatePanelProps = {
  selectedDate: string;
  onApplied: (date: string) => void;
};

async function readResponseMessage(response: Response, fallbackMessage: string) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export function ScheduleTemplatePanel({
  selectedDate,
  onApplied,
}: ScheduleTemplatePanelProps) {
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [applyDate, setApplyDate] = useState(selectedDate);
  const [editingNames, setEditingNames] = useState<Record<number, string>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [applyDateScheduleCount, setApplyDateScheduleCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingApplyDate, setIsCheckingApplyDate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTemplate = useMemo(() => {
    return templates.find((template) => String(template.id) === selectedTemplateId);
  }, [selectedTemplateId, templates]);

  useEffect(() => {
    // Keep the default apply target aligned with the visible schedule date.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setApplyDate(selectedDate);
  }, [selectedDate]);

  async function refreshTemplates() {
    const response = await fetch("/api/schedule-templates");

    if (!response.ok) {
      throw new Error("テンプレート取得に失敗しました。");
    }

    const data = (await response.json()) as ScheduleTemplate[];
    setTemplates(data);
    setEditingNames(
      Object.fromEntries(data.map((template) => [template.id, template.name])),
    );
    setSelectedTemplateId((current) => current || String(data[0]?.id ?? ""));
  }

  useEffect(() => {
    async function fetchTemplates() {
      setIsLoading(true);
      setError("");

      try {
        await refreshTemplates();
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "テンプレート取得に失敗しました。",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  useEffect(() => {
    async function fetchApplyDateSchedules() {
      setApplyDateScheduleCount(0);

      if (!applyDate) {
        return;
      }

      setIsCheckingApplyDate(true);

      try {
        const params = new URLSearchParams({ date: applyDate });
        const response = await fetch(`/api/schedules?${params.toString()}`);

        if (!response.ok) {
          throw new Error("適用先の確認に失敗しました。");
        }

        const schedules = (await response.json()) as unknown[];
        setApplyDateScheduleCount(schedules.length);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "適用先の確認に失敗しました。",
        );
      } finally {
        setIsCheckingApplyDate(false);
      }
    }

    fetchApplyDateSchedules();
  }, [applyDate]);

  async function handleCreate() {
    setMessage("");
    setError("");

    if (!templateName.trim()) {
      setError("テンプレート名を入力してください。");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/schedule-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: templateName, sourceDate: selectedDate }),
      });

      if (!response.ok) {
        throw new Error(
          await readResponseMessage(response, "テンプレート作成に失敗しました。"),
        );
      }

      const data = (await response.json()) as ScheduleTemplate;

      setTemplateName("");
      setSelectedTemplateId(String(data.id));
      setMessage("テンプレートを作成しました。");
      await refreshTemplates();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "テンプレート作成に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRename(templateId: number) {
    setMessage("");
    setError("");

    const name = editingNames[templateId]?.trim() ?? "";

    if (!name) {
      setError("テンプレート名を入力してください。");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/schedule-templates/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error(
          await readResponseMessage(response, "テンプレート更新に失敗しました。"),
        );
      }

      setMessage("テンプレート名を更新しました。");
      await refreshTemplates();
    } catch (renameError) {
      setError(
        renameError instanceof Error
          ? renameError.message
          : "テンプレート更新に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(templateId: number) {
    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/schedule-templates/${templateId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          await readResponseMessage(response, "テンプレート削除に失敗しました。"),
        );
      }

      setMessage("テンプレートを削除しました。");
      setSelectedTemplateId("");
      await refreshTemplates();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "テンプレート削除に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleApply() {
    setMessage("");
    setError("");

    if (!selectedTemplate || !applyDate) {
      setError("テンプレートと適用日を選択してください。");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/schedule-templates/${selectedTemplate.id}/apply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: applyDate }),
        },
      );

      if (!response.ok) {
        throw new Error(
          await readResponseMessage(response, "テンプレート適用に失敗しました。"),
        );
      }

      const data = (await response.json()) as { count?: number };

      setMessage(`${data.count ?? 0}件の予定を登録しました。`);
      setApplyDateScheduleCount(data.count ?? 0);
      onApplied(applyDate);
    } catch (applyError) {
      setError(
        applyError instanceof Error
          ? applyError.message
          : "テンプレート適用に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">
          テンプレート
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          表示日の予定を保存し、任意の日付へ一括登録します。
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">テンプレート名</span>
          <input
            type="text"
            value={templateName}
            onChange={(event) => setTemplateName(event.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            placeholder="例: 平日"
          />
        </label>
        <button
          type="button"
          onClick={handleCreate}
          disabled={isSubmitting}
          className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          表示日の予定から作成
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">適用テンプレート</span>
          <select
            value={selectedTemplateId}
            onChange={(event) => setSelectedTemplateId(event.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">選択してください</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">適用日</span>
          <input
            type="date"
            value={applyDate}
            onChange={(event) => setApplyDate(event.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </label>
      </div>

      <div className="mt-4 rounded-md bg-slate-50 p-3">
        {isLoading ? <p className="text-sm text-slate-500">読み込み中...</p> : null}
        {!isLoading && !selectedTemplate ? (
          <p className="text-sm text-slate-500">テンプレートを選択してください。</p>
        ) : null}
        {selectedTemplate ? (
          <ul className="space-y-2">
            {selectedTemplate.items.map((item) => (
              <li key={item.id} className="text-sm text-slate-700">
                {item.startTime}-{item.endTime} {item.title}
                <span
                  className="ml-2 rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{
                    backgroundColor: `${item.category.color}20`,
                    color: item.category.color,
                  }}
                >
                  {item.category.name}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleApply}
          disabled={
            isSubmitting ||
            isCheckingApplyDate ||
            !selectedTemplate ||
            applyDateScheduleCount > 0
          }
          className="h-10 w-full rounded-md bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
        >
          {isSubmitting ? "適用中..." : "適用する"}
        </button>
      </div>

      {applyDateScheduleCount > 0 ? (
        <p className="mt-3 text-sm font-medium text-amber-700">
          適用先の日付にはすでにスケジュールがあります。
        </p>
      ) : null}

      {templates.length > 0 ? (
        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
          {templates.map((template) => (
            <div key={template.id} className="grid gap-2">
              <input
                type="text"
                value={editingNames[template.id] ?? template.name}
                onChange={(event) =>
                  setEditingNames((current) => ({
                    ...current,
                    [template.id]: event.target.value,
                  }))
                }
                className="h-9 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleRename(template.id)}
                  disabled={isSubmitting}
                  className="h-8 flex-1 rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  更新
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(template.id)}
                  disabled={isSubmitting}
                  className="h-8 flex-1 rounded-md border border-rose-200 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}
      {message ? (
        <p className="mt-3 text-sm font-medium text-emerald-700">{message}</p>
      ) : null}
    </section>
  );
}
