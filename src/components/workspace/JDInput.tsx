"use client";

import { ClipboardList } from "lucide-react";

export interface JDFields {
  jobTitle: string;
  company: string;
  description: string;
}

interface JDInputProps {
  value: JDFields;
  onChange: (fields: JDFields) => void;
}

export function JDInput({ value, onChange }: JDInputProps) {
  const update = (field: keyof JDFields, val: string) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
        <ClipboardList size={16} className="text-indigo-500" />
        岗位信息
      </h3>
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">岗位名称</label>
          <input
            type="text"
            value={value.jobTitle}
            onChange={(e) => update("jobTitle", e.target.value)}
            placeholder="如：高级前端工程师"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">所在公司</label>
          <input
            type="text"
            value={value.company}
            onChange={(e) => update("company", e.target.value)}
            placeholder="如：字节跳动"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500">岗位描述</label>
        <textarea
          value={value.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="粘贴岗位 JD 内容，包括职责、要求等..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          rows={5}
        />
      </div>
    </div>
  );
}
