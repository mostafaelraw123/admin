import Card from '@/components/common/card';
import ShopLayout from '@/components/layouts/shop';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { LIMIT } from '@/utils/constants';
import { useShopQuery } from '@/data/shop';
import { useRefundsQuery } from '@/data/refund';
import RefundList from '@/components/refund/refund-list';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { SortOrder } from '@/types';

export default function RefundsPage() {
  const {
    query: { shop },
    locale,
  } = useRouter();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);
  const { data: shopData, isLoading: fetchingShop } = useShopQuery({
    slug: shop as string,
  });
  const shopId = shopData?.id!;
  const { data, loading, error } = useRefundsQuery(
    {
      shop_id: shopId,
      limit: LIMIT,
      page,
      sortedBy,
      orderBy,
    },
    {
      enabled: Boolean(shopId),
    }
  );

  if (loading || fetchingShop)
    return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handlePagination(current: any) {
    setPage(current);
  }

  return (
    <>
      <Card className="mb-8 flex flex-col items-center justify-between md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/4">
          <h1 className="text-lg font-semibold text-heading">
            {t('common:sidebar-nav-item-refunds')}
          </h1>
        </div>
      </Card>

      <RefundList
        refunds={data}
        onPagination={handlePagination}
        onOrder={setOrder}
        onSort={setColumn}
      />
    </>
  );
}
RefundsPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
RefundsPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
