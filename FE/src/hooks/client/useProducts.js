import { useQuery } from "@tanstack/react-query";

import {
  detailProductGet,
  productsCategoryGet,
} from "../../services/client/productServies";
import { listCategoriesGet } from "../../services/client/categoriesServies";
import { listBrand } from "../../services/client/brandServices";
import { listHomeGet } from "../../services/client/homeServies";

function useProducts({
  slug,
  sortKey,
  sortType,
  priceRange,
  slugProduct,
  brand_id,
  sex,
} = {}) {
  // GET products
  const productsQuery = useQuery({
    queryKey: ["products", slug, sortKey, sortType, priceRange, brand_id, sex],
    queryFn: () =>
      productsCategoryGet(
        slug,
        sortKey,
        sortType,
        priceRange,
        brand_id,
        sex
      ).then((res) => res.products),
    enabled: !!slug, // chỉ chạy khi slug có giá trị
    keepPreviousData: true,
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategoriesGet().then((res) => res.data),
  });

  const brandsQuery = useQuery({
    queryKey: ["brands"],
    queryFn: () => listBrand().then((res) => res.data),
  });

  const productQuery = useQuery({
    queryKey: ["product", slugProduct],
    queryFn: () => detailProductGet(slugProduct).then((res) => res.data),
    enabled: !!slugProduct, // chỉ chạy query khi có slugProduct
  });

  const homeQuery = useQuery({
    queryKey: ["home"],
    queryFn: () => listHomeGet().then((res) => res.data),
  });

  return {
    productsQuery,
    categoriesQuery,
    productQuery,
    brandsQuery,
    homeQuery,
  };
}

export default useProducts;
