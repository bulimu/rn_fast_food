import { useAppwriteQuery } from '@/lib/useAppwrite';
import { getProductDetail, getCategories, getMenu } from '@/lib/appwrite';


export const useProduct = (productId: string) => {
  return useAppwriteQuery({
    fn: getProductDetail,
    params: { productId },
    queryKey: ['product', productId],
    enabled: !!productId,
    staleTime: 1000 * 60 * 10, // product detail cached for 10 minutes
  });
};

export const useCategories = () => {
  return useAppwriteQuery({
    fn: getCategories,
    params: {},
    queryKey: ['categories'],
    staleTime: 1000 * 60 * 30, //categories data cached for 30 minutes
  });
};

export const useMenu = (category?: string, query?: string, limit = 6) => {
  return useAppwriteQuery({
    fn: getMenu,
    params: { category: category || '', query: query || '', limit },
    queryKey: ['menu', category, query, limit],
    staleTime: 1000 * 60 * 5, // menu data cached for 5 minutes
  });
};
