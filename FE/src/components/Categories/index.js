import { useState, useEffect } from "react";
import { Typography, Breadcrumb, Input, Button, Radio, Spin } from "antd";
import { NavLink, useSearchParams } from "react-router-dom";
import ListProduct from "../ListProduct";
import useProducts from "../../hooks/client/useProducts";
import { ClearOutlined, DownOutlined } from "@ant-design/icons";

const { Title } = Typography;

function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const slugParam = searchParams.get("danhmuc");

  const [sortKey, setSortKey] = useState("");
  const [sortType, setSortType] = useState("asc");
  const [priceRange, setPriceRange] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeTab, setActiveTab] = useState("moi-nhat");

  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [displayCount, setDisplayCount] = useState(40);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedGender, setSelectedGender] = useState("");

  const { productsQuery, categoriesQuery, brandsQuery } = useProducts({
    slug: slugParam,
    sortKey,
    sortType,
    priceRange,
    brand_id: selectedBrands,
    sex: selectedGender,
  });

  // 🟢 useEffect luôn được gọi trước bất kỳ return nào
  useEffect(() => {
    if (!categoriesQuery.data || !slugParam) return;

    const brand = searchParams.get("brand") || "";
    const sex = searchParams.get("sex") || "";
    const price = searchParams.get("price") || "";
    const sort = searchParams.get("sort") || "";

    if (brand) setSelectedBrands(brand);
    if (sex) setSelectedGender(sex);
    if (price) {
      setPriceRange(price);
      const [min, max] = price.split("-");
      setPriceMin(min);
      setPriceMax(max);
    }

    // parse sort
    if (sort.includes("-")) {
      const [key, order] = sort.split("-");
      setSortKey(key);
      setSortType(order);
    }

    const categoryCurrent = categoriesQuery.data.find(
      (cat) => cat.slug === slugParam
    );

    if (categoryCurrent) {
      setSelectedCategory(categoryCurrent._id.toString());
    }
  }, [categoriesQuery.data]);


  useEffect(() => {
    switch (activeTab) {
      case "tat-ca":
        setSortKey("all");
        setSortType("asc");
        break;
      case "moi-nhat":
        setSortKey("latest");
        setSortType("desc");
        break;
      case "ban-chay":
        setSortKey("bestseller");
        setSortType("desc");
        break;
      case "gia-thap":
        setSortKey("price");
        setSortType("asc");
        break;
      case "gia-cao":
        setSortKey("price");
        setSortType("desc");
        break;
      default:
        setSortKey("");
        setSortType("asc");
    }
  }, [activeTab]);

  const updateURLParams = (newParams) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    const updatedParams = { ...currentParams, ...newParams };

    // Loại bỏ key null/undefined/"" để URL gọn gàng
    Object.keys(updatedParams).forEach(
      (key) => !updatedParams[key] && delete updatedParams[key]
    );

    setSearchParams(updatedParams);
  };

  const handleCategoryChange = (e) => {
    const id = e.currentTarget.dataset.categoryId;
    const category = categoriesQuery.data?.find(
      (cat) => cat._id.toString() === id
    );
    if (category) {
      setSearchParams({ danhmuc: category.slug });
      updateURLParams({ danhmuc: category.slug });
      setSelectedCategory(id);
    }
  };

  const handleBrandChange = (e) => {
    const id = e.currentTarget.dataset.brandId;
    setSelectedBrands(id);
    updateURLParams({ brand: id });
  };

  const handleGenderChange = (e) => {
    setSelectedGender(e.target.value);
    updateURLParams({ sex: e.target.value });
  };

  const clearAllFilters = () => {
    setPriceMax(0);
    setPriceMin(0);
    setPriceRange(null);
    setSelectedBrands(null);
    setSelectedGender(null);

    setSearchParams({ danhmuc: slugParam });
  };

  const handleTabChange = (key) => {
    setActiveTab(key);

    let sortValue = "";
    switch (key) {
      case "moi-nhat": sortValue = "latest-desc"; break;
      case "ban-chay": sortValue = "bestseller-desc"; break;
      case "gia-thap": sortValue = "price-asc"; break;
      case "gia-cao": sortValue = "price-desc"; break;
      default: sortValue = "all-asc";
    }

    updateURLParams({ sort: sortValue });
  };


  // 🟡 Sau khi gọi tất cả useEffect, mới return JSX có điều kiện
  if (
    categoriesQuery.isLoading ||
    brandsQuery.isLoading ||
    productsQuery.isLoading
  ) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (categoriesQuery.isError || brandsQuery.isError || productsQuery.isError) {
    return (
      <div className="text-center text-red-500 mt-10">
        Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
      </div>
    );
  }

  if (!categoriesQuery.data || !productsQuery.data) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Dữ liệu đang được tải...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <Breadcrumb style={{ margin: "16px 0" }}>
        <Breadcrumb.Item>
          <NavLink to="/">Home</NavLink>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Danh mục</Breadcrumb.Item>
        <Breadcrumb.Item>
          {categoriesQuery.data.find((c) => c._id === selectedCategory)?.title}
        </Breadcrumb.Item>
      </Breadcrumb>

      <Title level={4} style={{ marginBottom: "24px" }}>
        Mua sắm theo danh mục
      </Title>

      <div className="flex gap-4">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 border-b">
          <div className="pb-6 border-b">
            <h3 className="font-bold text-base mb-3 uppercase">DANH MỤC</h3>
            {categoriesQuery.data.map((category) => (
              <button
                key={category._id}
                data-category-id={category._id}
                onClick={handleCategoryChange}
                className={`block w-full text-left px-3 py-2 text-sm rounded ${category._id === selectedCategory
                  ? "bg-green-50 text-green-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                {category.title}
              </button>
            ))}
          </div>
          <div style={{ textAlign: "end" }}>
            <Button
              type="text"
              icon={<ClearOutlined />}
              onClick={clearAllFilters}
              className="text-gray-500 hover:text-red-500"
            >
              Xóa tất cả
            </Button>
          </div>
          {/* Khoảng giá */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="font-bold text-sm mb-3 uppercase">KHOẢNG GIÁ</h3>
            <div className="flex gap-2 mb-2">
              <Input
                type="number"
                placeholder="đ TỪ"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
              />
              <span className="self-center text-gray-400">-</span>
              <Input
                type="number"
                placeholder="đ ĐẾN"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
              />
            </div>
            <Button
              className="w-full bg-green-700 hover:bg-green-800 text-white"
              onClick={() => {
                const range = priceMin && priceMax ? `${priceMin}-${priceMax}` : "";
                setPriceRange(range);
                updateURLParams({ price: range });
              }}
            >
              Áp dụng
            </Button>
          </div>

          {/* Giới tính */}
          <div className="mt-6 border-b">
            <h3 className="font-bold text-sm mb-3 uppercase">Giới tính</h3>
            <Radio.Group
              className="flex"
              value={selectedGender}
              onChange={handleGenderChange}
            >
              <Radio value="0">Nam</Radio>
              <Radio value="1">Nữ</Radio>
              <Radio value="2">Unisex</Radio>
            </Radio.Group>
          </div>

          {/* Thương hiệu */}
          <div className="mt-6">
            <h3 className="font-bold text-sm mb-3 uppercase">THƯƠNG HIỆU</h3>
            {brandsQuery.data.map((brand) => (
              <button
                key={brand._id}
                data-brand-id={brand._id}
                onClick={handleBrandChange}
                className={`block w-full text-left px-3 py-2 text-sm rounded ${brand._id === selectedBrands
                  ? "bg-green-50 text-green-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                {brand.title}
              </button>
            ))}
          </div>
        </div>

        {/* Sản phẩm */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2">
            <div className="flex items-center gap-1">
              <h2 className="text-lg font-medium mr-4">
                {categoriesQuery.data.find((c) => c._id === selectedCategory)
                  ?.title || "Tất cả"}{" "}
                ({productsQuery.data.length})
              </h2>

              {["tat-ca", "moi-nhat", "ban-chay", "gia-thap", "gia-cao"].map(
                (key) => (
                  <button
                    key={key}
                    onClick={() => handleTabChange(key)}
                    className={`px-4 py-2 text-sm ${activeTab === key
                      ? "text-green-600 border-b-2 border-green-600 font-medium"
                      : "text-gray-600"
                      }`}
                  >
                    {
                      {
                        "tat-ca": "Tất cả",
                        "moi-nhat": "Mới nhất",
                        "ban-chay": "Bán chạy",
                        "gia-thap": "Giá thấp đến cao",
                        "gia-cao": "Giá cao đến thấp",
                      }[key]
                    }
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Hiển thị</span>
              <button className="flex items-center gap-1 px-3 py-1 border rounded text-sm">
                {displayCount}
                <DownOutlined className="w-4 h-4" />
              </button>
            </div>
          </div>

          <ListProduct products={productsQuery.data || []} count={8} />
        </div>
      </div>
    </div>
  );
}

export default Categories;
