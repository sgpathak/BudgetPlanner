import React, { useState } from 'react';
import { X, Plus, Sparkles, FolderPlus, Tag } from 'lucide-react';
import { ExpenseCategory, ExpenseGroup } from '../types/finance';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (category: ExpenseCategory) => void;
  existingCategories: ExpenseCategory[];
  defaultGroup?: ExpenseGroup;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onAddCategory,
  existingCategories,
  defaultGroup = 'miscellaneous',
}) => {
  const [mode, setMode] = useState<'new_category' | 'new_subcategory'>('new_category');
  const [name, setName] = useState('');
  const [group, setGroup] = useState<ExpenseGroup>(defaultGroup);
  const [color, setColor] = useState('#0ea5e9');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');

  // Subcategory fields
  const [parentCategoryId, setParentCategoryId] = useState<string>(
    existingCategories[0]?.id || 'misc_general'
  );
  const [subcategoryName, setSubcategoryName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'new_category') {
      if (!name.trim()) return;

      const id = `cat_custom_${Date.now()}`;
      const kwList = keywords
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);

      // Add name as keyword too
      if (!kwList.includes(name.trim().toLowerCase())) {
        kwList.push(name.trim().toLowerCase());
      }

      const newCategory: ExpenseCategory = {
        id,
        name: name.trim(),
        group,
        color,
        iconName: 'Tag',
        description: description.trim() || undefined,
        keywords: kwList,
        isCustom: true,
      };

      onAddCategory(newCategory);
      onClose();
    } else {
      if (!subcategoryName.trim()) return;
      const parent = existingCategories.find((c) => c.id === parentCategoryId);
      if (!parent) return;

      const updatedSubcategories = parent.subcategories ? [...parent.subcategories] : [];
      if (!updatedSubcategories.includes(subcategoryName.trim())) {
        updatedSubcategories.push(subcategoryName.trim());
      }

      const updatedCategory: ExpenseCategory = {
        ...parent,
        subcategories: updatedSubcategories,
        keywords: [...parent.keywords, subcategoryName.trim().toLowerCase()],
      };

      onAddCategory(updatedCategory);
      onClose();
    }
  };

  const colorOptions = [
    '#0ea5e9', // sky
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#f59e0b', // amber
    '#f97316', // orange
    '#ec4899', // pink
    '#ef4444', // red
    '#64748b', // slate
    '#14b8a6', // teal
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Add Category or Subcategory
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Create miscellaneous expenses on the fly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('new_category')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'new_category' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New Category
            </button>
            <button
              type="button"
              onClick={() => setMode('new_subcategory')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'new_subcategory' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Subcategory
            </button>
          </div>

          {mode === 'new_category' ? (
            <>
              {/* Category Name */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Home Painting, Pet Care, Medical Emergency..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* Group */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Budget Group
                </label>
                <select
                  value={group}
                  onChange={(e) => setGroup(e.target.value as ExpenseGroup)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer font-medium"
                >
                  <option value="miscellaneous">Miscellaneous Expenses (On the fly)</option>
                  <option value="savings">Savings & Investments</option>
                  <option value="fixed">Fixed Expenses</option>
                  <option value="yearly">Yearly Expenses</option>
                </select>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Category Color Accent
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                        color === c ? 'ring-2 ring-slate-900 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Keywords for Auto-Categorization */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Smart Keywords <span className="font-normal text-slate-400">(Comma separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. paint, asian paints, hardware, plumber"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  FinFlow will automatically assign transactions matching these keywords to this category.
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Parent Category */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Select Parent Category
                </label>
                <select
                  value={parentCategoryId}
                  onChange={(e) => setParentCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {existingCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.group})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Name */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Subcategory Label <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Emergency Plumber, School Uniform, Diwali Bonus..."
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{mode === 'new_category' ? 'Create Category' : 'Add Subcategory'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
