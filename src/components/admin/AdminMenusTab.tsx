import React, { useState } from 'react';
import { SchoolConfig, NavMenu, DropdownItem } from '../../types';
import { Plus, Trash2, ChevronDown, ListPlus, MoveUp, MoveDown, Layers, Link2 } from 'lucide-react';

interface AdminMenusTabProps {
  config: SchoolConfig;
  onChange: (updated: SchoolConfig) => void;
}

export const AdminMenusTab: React.FC<AdminMenusTabProps> = ({ config, onChange }) => {
  const { navMenus } = config;
  const [newMenuLabel, setNewMenuLabel] = useState('');
  const [newMenuPath, setNewMenuPath] = useState('');
  const [newIsDropdown, setNewIsDropdown] = useState(false);

  // Submenu input state for a specific menu
  const [activeMenuForSubmenu, setActiveMenuForSubmenu] = useState<string | null>(null);
  const [subLabel, setSubLabel] = useState('');
  const [subPath, setSubPath] = useState('');
  const [subDesc, setSubDesc] = useState('');

  const updateMenus = (updated: NavMenu[]) => {
    onChange({
      ...config,
      navMenus: updated,
    });
  };

  const handleAddMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuLabel.trim()) return;

    const newMenu: NavMenu = {
      id: `menu-${Date.now()}`,
      label: newMenuLabel.trim(),
      path: newMenuPath.trim() || '#',
      isDropdown: newIsDropdown,
      dropdownItems: newIsDropdown ? [] : undefined,
      enabled: true,
    };

    updateMenus([...navMenus, newMenu]);
    setNewMenuLabel('');
    setNewMenuPath('');
    setNewIsDropdown(false);
  };

  const handleDeleteMenu = (id: string) => {
    if (confirm('Yakin ingin menghapus menu ini?')) {
      updateMenus(navMenus.filter((m) => m.id !== id));
    }
  };

  const handleToggleMenu = (id: string) => {
    updateMenus(
      navMenus.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const handleToggleDropdownType = (id: string) => {
    updateMenus(
      navMenus.map((m) => {
        if (m.id === id) {
          const nextIsDropdown = !m.isDropdown;
          return {
            ...m,
            isDropdown: nextIsDropdown,
            dropdownItems: nextIsDropdown ? m.dropdownItems || [] : undefined,
          };
        }
        return m;
      })
    );
  };

  const handleAddSubmenuItem = (menuId: string) => {
    if (!subLabel.trim()) return;

    const newItem: DropdownItem = {
      id: `sub-${Date.now()}`,
      label: subLabel.trim(),
      path: subPath.trim() || '#',
      description: subDesc.trim() || undefined,
    };

    updateMenus(
      navMenus.map((m) => {
        if (m.id === menuId) {
          return {
            ...m,
            dropdownItems: [...(m.dropdownItems || []), newItem],
          };
        }
        return m;
      })
    );

    setSubLabel('');
    setSubPath('');
    setSubDesc('');
  };

  const handleDeleteSubmenuItem = (menuId: string, subId: string) => {
    updateMenus(
      navMenus.map((m) => {
        if (m.id === menuId) {
          return {
            ...m,
            dropdownItems: (m.dropdownItems || []).filter((item) => item.id !== subId),
          };
        }
        return m;
      })
    );
  };

  const moveMenu = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= navMenus.length) return;

    const copy = [...navMenus];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    updateMenus(copy);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Overview & Add Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>Pengaturan Menu Navigasi &amp; Dropdown</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Atur susunan menu bar di bagian atas website, jadikan menu bertingkat (dropdown), dan atur link tujuan.
          </p>
        </div>

        {/* Add New Menu Bar */}
        <form onSubmit={handleAddMenu} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
            + Tambah Menu Navigasi Utama
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-4">
              <label className="text-xs text-slate-600 font-semibold block mb-1">Nama Menu</label>
              <input
                type="text"
                value={newMenuLabel}
                onChange={(e) => setNewMenuLabel(e.target.value)}
                placeholder="Contoh: PPDB / Kurikulum"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="text-xs text-slate-600 font-semibold block mb-1">Link Target / ID Hash</label>
              <input
                type="text"
                value={newMenuPath}
                onChange={(e) => setNewMenuPath(e.target.value)}
                placeholder="#berita atau https://..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex items-center h-10">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newIsDropdown}
                  onChange={(e) => setNewIsDropdown(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Punya Dropdown?</span>
              </label>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </div>
          </div>
        </form>

        {/* Existing Menus List */}
        <div className="space-y-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Daftar Menu Navigasi Aktif ({navMenus.length})
          </span>

          {navMenus.map((menu, index) => (
            <div
              key={menu.id}
              className={`p-4 rounded-xl border transition-all ${
                menu.enabled
                  ? 'bg-white border-slate-300 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              {/* Menu Row Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveMenu(index, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      title="Pindahkan Ke Atas"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === navMenus.length - 1}
                      onClick={() => moveMenu(index, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      title="Pindahkan Ke Bawah"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{menu.label}</span>
                      {menu.isDropdown && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                          <ChevronDown className="w-3 h-3" />
                          Dropdown ({menu.dropdownItems?.length || 0} item)
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                      <Link2 className="w-3 h-3 text-slate-400" />
                      {menu.path}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleDropdownType(menu.id)}
                    className="text-xs px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    {menu.isDropdown ? 'Jadikan Link Biasa' : 'Jadikan Dropdown'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleMenu(menu.id)}
                    className={`text-xs px-2.5 py-1 rounded font-semibold ${
                      menu.enabled
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {menu.enabled ? 'Aktif' : 'Nonaktif'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteMenu(menu.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Menu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dropdown Items Editor if this menu is a dropdown */}
              {menu.isDropdown && (
                <div className="mt-4 pt-4 border-t border-slate-100 pl-4 sm:pl-8 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Submenu / Dropdown Items:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenuForSubmenu(
                          activeMenuForSubmenu === menu.id ? null : menu.id
                        )
                      }
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <ListPlus className="w-3.5 h-3.5" />
                      <span>{activeMenuForSubmenu === menu.id ? 'Tutup Form Submenu' : '+ Tambah Submenu'}</span>
                    </button>
                  </div>

                  {/* Add submenu form */}
                  {activeMenuForSubmenu === menu.id && (
                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={subLabel}
                          onChange={(e) => setSubLabel(e.target.value)}
                          placeholder="Label Submenu (misal: Visi Misi)"
                          className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          value={subPath}
                          onChange={(e) => setSubPath(e.target.value)}
                          placeholder="Path / ID (#sambutan)"
                          className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          value={subDesc}
                          onChange={(e) => setSubDesc(e.target.value)}
                          placeholder="Keterangan singkat (opsional)"
                          className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleAddSubmenuItem(menu.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          Simpan Submenu
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Existing Submenu Items */}
                  <div className="space-y-2">
                    {menu.dropdownItems && menu.dropdownItems.length > 0 ? (
                      menu.dropdownItems.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800">{sub.label}</span>
                            <span className="text-slate-400 font-mono ml-2">({sub.path})</span>
                            {sub.description && (
                              <span className="text-slate-500 block text-[11px] mt-0.5">
                                {sub.description}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubmenuItem(menu.id, sub.id)}
                            className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                            title="Hapus Submenu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Belum ada item submenu. Klik "+ Tambah Submenu" untuk menambahkan.
                      </p>
                    )}
                  </div>

                </div>
              )}

            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
