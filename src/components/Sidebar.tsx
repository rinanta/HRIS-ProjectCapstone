'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Clock, 
  CalendarDays, 
  CheckSquare, 
  Users, 
  Receipt, 
  BarChart3, 
  Settings, 
  LogOut,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { Profile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface SidebarProps {
  profile: Profile | null;
  pendingCount?: number;
}

export default function Sidebar({ profile, pendingCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/masuk');
    router.refresh();
  };

  const peran = profile?.peran || 'karyawan';

  // Daftar menu sesuai PRD Seksi 7
  const menus = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['karyawan', 'atasan', 'hrd']
    },
    {
      title: 'Absensi',
      href: '/absensi',
      icon: Clock,
      roles: ['karyawan', 'atasan', 'hrd']
    },
    {
      title: 'Cuti dan Izin',
      href: '/cuti',
      icon: CalendarDays,
      roles: ['karyawan', 'atasan', 'hrd']
    },
    {
      title: 'Persetujuan',
      href: '/persetujuan',
      icon: CheckSquare,
      roles: ['atasan', 'hrd'] // Atasan & HRD
    },
    {
      title: 'Data Karyawan',
      href: '/karyawan',
      icon: Users,
      roles: ['atasan', 'hrd'] // Atasan baca timnya, HRD kelola
    },
    {
      title: 'Slip Gaji',
      href: '/slip-gaji',
      icon: Receipt,
      roles: ['karyawan', 'atasan', 'hrd']
    },
    {
      title: 'Laporan',
      href: '/laporan',
      icon: BarChart3,
      roles: ['hrd'] // Khusus HRD
    },
    {
      title: 'Pengaturan',
      href: '/pengaturan',
      icon: Settings,
      roles: ['hrd'] // Khusus HRD
    }
  ];

  const filteredMenus = menus.filter(m => m.roles.includes(peran));

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'hrd':
        return <span style={{ background: '#4f46e5', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>HRD</span>;
      case 'atasan':
        return <span style={{ background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>ATASAN</span>;
      default:
        return <span style={{ background: '#64748b', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>KARYAWAN</span>;
    }
  };

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#0b1329',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      borderRight: '1px solid #1e293b'
    }} className="sidebar">
      {/* Brand Header */}
      <div style={{
        padding: '20px 20px',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Building2 size={20} color="#38bdf8" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em', lineHeight: 1.2, color: '#f8fafc' }}>
            KLN HRIS
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
            PT Karsa Lintas Nusantara
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 10px 8px' }}>
          Navigasi Utama
        </div>
        <ul style={{ listStyle: 'none' }}>
          {filteredMenus.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href} style={{ marginBottom: '3px' }}>
                <Link
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '11px',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.12s ease'
                  }}
                >
                  <Icon size={18} color={isActive ? '#38bdf8' : '#64748b'} />
                  <span>{item.title}</span>
                  {item.href === '/persetujuan' && pendingCount > 0 && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        background: '#f43f5e',
                        color: '#ffffff',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '1px 8px',
                        borderRadius: '9999px',
                        boxShadow: '0 2px 6px rgba(244, 63, 94, 0.45)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '20px',
                        lineHeight: 1.3
                      }}
                      title={`${pendingCount} pengajuan cuti menunggu persetujuan Anda`}
                    >
                      {pendingCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout Footer */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: '#f8fafc',
            flexShrink: 0
          }}>
            {profile?.nama_lengkap ? profile.nama_lengkap.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile?.nama_lengkap || 'Memuat...'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
              {getRoleBadge(peran)}
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile?.divisi?.nama || profile?.jabatan || ''}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '6px',
            color: '#fca5a5',
            fontSize: '0.825rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
          }}
        >
          <LogOut size={15} />
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </aside>
  );
}
