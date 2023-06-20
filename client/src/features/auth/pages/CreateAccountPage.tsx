import { useEffect } from 'react';

import { CurrentUser } from '@databank/types';
import { useNotificationsStore } from '@douglasneuroinformatics/react-components';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { AuthLayout } from '../components/AuthLayout';
import { type CreateAccountData, CreateAccountForm } from '../components/CreateAccountForm';

import { useAuthStore } from '@/stores/auth-store';

export const CreateAccountPage = () => {
  const auth = useAuthStore();
  const notifications = useNotificationsStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const createAccount = async (data: CreateAccountData) => {
    const response = await axios.post<CurrentUser>('/v1/auth/account', data);
    notifications.addNotification({ type: 'success' });
    auth.setCurrentUser(response.data);
  };

  useEffect(() => {
    if (auth.currentUser) {
      navigate('/auth/verify-account', {
        replace: true
      });
    }
  }, [auth.currentUser]);

  return (
    <AuthLayout title={t('createAccount')}>
      <CreateAccountForm onSubmit={createAccount} />
    </AuthLayout>
  );
};
