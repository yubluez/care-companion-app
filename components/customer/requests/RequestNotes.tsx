"use client";

type Props = {
  note: string;
  onNoteChange: (value: string) => void;
};

export default function RequestNotes({ note, onNoteChange }: Props) {
  return (
    <section className="space-y-3 p-6 sm:p-8">
      <label htmlFor="request-note" className="block font-semibold">
        รายละเอียดเพิ่มเติม
      </label>

      <textarea
        id="request-note"
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-sky-500"
        rows={2}
        maxLength={500}
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="สิ่งที่ Companion ควรทราบ"
      />

      <p className="text-right text-xs text-slate-500">{note.length}/500</p>
    </section>
  );
}
