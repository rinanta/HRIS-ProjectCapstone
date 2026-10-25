'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { Profile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppShell({ children, title }: AppShellProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const loadPendingCount = useCallback(async (prof: Profile) => {
    try {
      if (prof.peran === 'atasan') {
        const { count, error } = await supabase
          .from('pengajuan_cuti')
          .select('id, karyawan:karyawan_id!inner(divisi_id)', { count: 'exact', head: true })
          .eq('status', 'diajukan')
          .eq('perlu_atasan', true)
          .neq('karyawan_id', prof.id)
          .eq('karyawan.divisi_id', prof.divisi_id);

        if (!error && typeof count === 'number') {
          setPendingApprovalsCount(count);
        }
      } else if (prof.peran === 'hrd') {
        const { count: c1 } = await supabase
          .from('pengajuan_cuti')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'disetujui_atasan')
          .neq('karyawan_id', prof.id);

        const { count: c2 } = await supabase
          .from('pengajuan_cuti')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'diajukan')
          .eq('perlu_atasan', false)
          .neq('karyawan_id', prof.id);

        const total = (c1 || 0) + (c2 || 0);
        setPendingApprovalsCount(total);
      }
    } catch (err) {
      console.error('Error fetching pending approvals count:', err);
    }
  }, [supabase]);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.push('/masuk');
          return;
        }

        const { data: prof, error: profError } = await supabase
          .from('profiles')
          .select('*, divisi:divisi_id(id, nama)')
          .eq('id', user.id)
          .single();

        if (profError || !prof) {
          router.push('/masuk');
          return;
        }

        // Cek akun aktif (BR-01)
        if (!prof.aktif) {
          await supabase.auth.signOut();
          router.push('/masuk?error=nonaktif');
          return;
        }

        const validProfile = prof as Profile;
        setProfile(validProfile);
        loadPendingCount(validProfile);
      } catch (err) {
        console.error('Error load profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router, supabase, loadPendingCount]);

  // Periodic poll for real-time notification
  useEffect(() => {
    if (!profile) return;
    const interval = setInterval(() => {
      loadPendingCount(profile);
    }, 15000);
    return () => clearInterval(interval);
  }, [profile, loadPendingCount]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-main)',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          border: '4px solid #e2e8f0',
          borderTopColor: '#4f46e5',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
          Memuat data HRIS...
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar profile={profile} pendingCount={pendingApprovalsCount} />
      <div className="main-content">
        <Header profile={profile} title={title} pendingCount={pendingApprovalsCount} />
        <main className="page-container">
          {children}
        </main>
      </div>
    </div>
  );
}
