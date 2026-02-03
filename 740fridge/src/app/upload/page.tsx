"use client";

import * as React from "react";

type UploadState =
  | { kind: "idle" }
  | { kind: "uploading" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function UploadPage() {
  const [state, setState] = React.useState<UploadState>({ kind: "idle" });
  const [file, setFile] = React.useState<File | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;

    setState({ kind: "uploading" });

    try {
      const formData = new FormData();
      formData.set("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as
        | { ok: true; url: string }
        | { ok: false; error: string };

      if (!response.ok || !data.ok)
        throw new Error("error" in data ? data.error : "Upload failed");

      setState({ kind: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setState({ kind: "error", message });
    }
  }

  if (state.kind === "success") {
    return (
      <div className="min-h-dvh grid place-items-center bg-[var(--background)] px-4">
        <div className="fridge-frame fridge-surface w-full max-w-md p-7">
          <div className="text-xs font-semibold tracking-[0.22em] text-zinc-500">
            740FRIDGE
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Your photo is on the fridge 🧲
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Thanks for leaving a little memory behind.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              className="h-11 rounded-xl border border-zinc-200 bg-white/70 font-medium text-zinc-900 hover:bg-white"
              onClick={() => {
                setFile(null);
                setState({ kind: "idle" });
              }}
            >
              Upload another
            </button>
            <a
              href="/"
              className="h-11 rounded-xl bg-zinc-900 text-white font-medium grid place-items-center hover:bg-zinc-800 active:bg-zinc-950"
            >
              View fridge
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--background)] px-4 py-6">
      <div className="mx-auto w-full max-w-md">
        <div className="fridge-frame fridge-surface p-6">
          <div className="text-xs font-semibold tracking-[0.22em] text-zinc-500">
            740FRIDGE
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Add a photo to the fridge
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Take a photo in the apartment or upload one from your camera roll.
          </p>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <div className="rounded-2xl border border-zinc-200 bg-white/65 p-4">
              <label className="text-sm font-medium text-zinc-800">
                Photo
                <input
                  className="mt-2 block w-full text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-white file:font-medium"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
              </label>
              <div className="mt-2 text-xs text-zinc-500">
                Tip: on iPhone, this will prompt Camera or Photo Library.
              </div>
            </div>

            {state.kind === "error" ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {state.message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!file || state.kind === "uploading"}
              className="h-11 rounded-xl bg-zinc-900 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 active:bg-zinc-950"
            >
              {state.kind === "uploading" ? "Uploading…" : "Upload to fridge"}
            </button>

            <a
              href="/"
              className="h-11 rounded-xl border border-zinc-200 bg-white/70 font-medium text-zinc-900 grid place-items-center hover:bg-white"
            >
              Back to fridge
            </a>
          </form>
        </div>
      </div>
    </div>
  );
}
