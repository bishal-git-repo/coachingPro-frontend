'use client';
import { useAuth } from '../../../context/AuthContext';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StudentReferralPortal from './student-portal';
import CoachingReferralPortal from './coaching-portal';
import { S } from '../../../lib/styles';

export default function ReferralsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <DashboardLayout>
      <div>
        <h2 style={{ ...S.pageTitle, marginBottom: 28 }}>Referral Program</h2>
        {user.role === 'student' ? (
          <StudentReferralPortal />
        ) : user.role === 'admin' ? (
          <CoachingReferralPortal />
        ) : (
          <div style={S.card}>
            <p style={{ color: '#64748b', textAlign: 'center', margin: 0 }}>
              Referral features are currently only available for Students and Coaching Admins.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
