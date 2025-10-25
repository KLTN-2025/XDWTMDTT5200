import { useEffect, useState } from "react";
import ListProduct from "../../../components/ListProduct";
import {
  Layout,
  Typography,
  Spin,
} from "antd";
import Article from "../articles/List";
import TopBanner from "../TopBanner";
import useProducts from "../../../hooks/client/useProducts";
import ProductSlider from "../../../components/ProductSlider";
import CategorySlider from "../../../components/CategorySlider";
import { productViewed } from "../../../services/client/productServies";
import { getViewedProducts } from "../../../helpers/viewedProducts";
import BrandSlider from "../../../components/BrandSlider";

const { Content } = Layout;
const { Title, Paragraph } = Typography;


function Home() {
  const [productVieweds, setProductVieweds] = useState([]);
  const [loading, setLoading] = useState(true); // 👈 Thêm loading
  const { categoriesQuery, homeQuery } = useProducts();

  const fetchApi = async () => {
    try {
      setLoading(true); // 👈 Bắt đầu loading
      const idsViewd = getViewedProducts();
      const responseViewed = await productViewed({ ids: idsViewd });

      if (responseViewed.code === 200) {
        setProductVieweds(responseViewed.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // 👈 Kết thúc loading
    }
  };

  useEffect(() => {
    fetchApi();
  }, []);

  // 👇 Hiển thị loading spinner nếu đang tải dữ liệu
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }
  // 🟡 Sau khi gọi tất cả useEffect, mới return JSX có điều kiện
  if (categoriesQuery.isLoading || homeQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <>
      <Layout className="min-h-screen">
        <Content>

          <TopBanner />

          {/* Categories */}
          <div style={{ textAlign: "center" }}>
            <Title level={2} style={{ marginBottom: "8px" }}>
              Mua sắm theo danh mục
            </Title>
            <Paragraph
              style={{
                maxWidth: "700px",
                margin: "0 auto",
                color: "rgba(0, 0, 0, 0.65)",
              }}
            >
              Duyệt qua nhiều loại sản phẩm của chúng tôi trong các danh mục phổ
              biến s
            </Paragraph>
          </div>

          <CategorySlider categories={categoriesQuery.data || []} />
          
          <BrandSlider brands={homeQuery.data.brands} />

          {/* Best Selling Products */}
          <ProductSlider
            products={homeQuery.data.bestSellingProducts || []}
            title={"Bán chạy"}
          />

          {/* Featured Products */}
          <div>
            <ListProduct
              products={homeQuery.data.featuredProducts}
              title={`Sản phẩm nỗi bật`}
            />
          </div>

          {/* Best Selling Products */}
          <ProductSlider products={productVieweds || []} title={"Đã xem"} />

          {/* Bài viết */}
          <Article />

          
        </Content>
      </Layout>
    </>
  );
}

export default Home;
