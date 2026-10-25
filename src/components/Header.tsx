'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Bell } from 'lucide-react';
import { formatTanggalIndo, getWIBTimeParts } from '@/lib/wib';
import { Profile } from '@/lib/types';

interface HeaderProps {
  profile: Profile | null;
  title?: string;
  pendingCount?: number;
}

export default function Header({ profile, title, pendingCount = 0 }: HeaderProps) {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const { timeStr: formattedTime } = getWIBTimeParts(now);
      setTimeStr(`${formattedTime} WIB`);
      setDateStr(formatTanggalIndo(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isApprover = profile?.peran === 'atasan' || profile?.peran === 'hrd';

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }} className="header-bar">
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          {title || 'Aplikasi HRIS'}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Live Server WIB Time indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#f8fafc',
          border: '1px solid var(--border-subtle)',
          padding: '5px 12px',
          borderRadius: '6px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-block' }} />
          <span className="tabular-nums" style={{ fontWeight: 600, color: '#0f172a' }}>{timeStr || '...'}</span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span>{dateStr}</span>
        </div>

        {/* Notification Bell for Atasan / HRD */}
        {isApprover && (
          <Link
            href="/persetujuan"
            style={{
              position: 'relative',
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              backgroundColor: pendingCount > 0 ? '#fff1f2' : '#ffffff',
              border: `1px solid ${pendingCount > 0 ? '#fecdd3' : '#e2e8f0'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: pendingCount > 0 ? '#dc2626' : '#64748b',
              textDecoration: 'none',
              transition: 'all 0.12s ease'
            }}
            title={pendingCount > 0 ? `Terdapat ${pendingCount} pengajuan cuti menunggu keputusan Anda` : 'Tidak ada antrean menunggu'}
          >
            <Bell size={17} />
            {pendingCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#dc2626',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: '9999px',
                border: '2px solid #ffffff',
                minWidth: '16px',
                textAlign: 'center',
                lineHeight: 1.2
              }}>
                {pendingCount}
              </span>
            )}
          </Link>
        )}

        {/* User profile badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '10px', borderLeft: '1px solid #e2e8f0' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a' }}>
              {profile?.nama_lengkap || 'Pengguna'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {profile?.jabatan || profile?.nik_karyawan || ''}
            </div>
          </div>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '6px',
            backgroundColor: '#f1f5f9',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem',
            border: '1px solid #cbd5e1'
          }}>
            {profile?.nama_lengkap ? profile.nama_lengkap.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
