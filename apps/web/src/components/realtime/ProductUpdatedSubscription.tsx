'use client';

import { useEffect } from 'react';
import { useApolloClient, useSubscription } from '@apollo/client';
import { PRODUCT_UPDATED_SUBSCRIPTION } from '@/gql/documents';
import { useToast } from '@/components/ui/Toast';

export default function ProductUpdatedSubscription() {
  const { pushToast } = useToast();
  const client = useApolloClient();
  const { data } = useSubscription(PRODUCT_UPDATED_SUBSCRIPTION);

  useEffect(() => {
    if (!data?.productUpdated) {
      return;
    }

    void client.refetchQueries({ include: 'active' });
    pushToast({
      title: 'PRODUCT UPDATE BROADCAST',
      description: `${data.productUpdated.name} changed`,
      variant: 'info',
    });
  }, [client, data, pushToast]);

  return null;
}
