import React, { ChangeEvent, FormEventHandler, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import {
  fetchBrands,
  fetchCategories,
  fetchColors,
  fetchSizes,
  fetchSubcategories,
  fetchProductById,
  updateProduct,
} from "../utils/api";
import { Size } from "../types/size";
import { produce } from "immer";
import i18n from "../i18n";
import { Subcategory } from "../types/subcategory";
import { Brand } from "../types/brand";
import { Color } from "../types/color";
import { VtonCategory } from "../types/product";
import { useParams } from "react-router-dom";

interface EditProps {
  token: string;
}

const Edit: React.FC<EditProps> = ({ token }) => {
  const { t } = useTranslation();
  const id = useParams().productId;

  const [images, setImages] = useState<File[]>([]);
  const [imagesUrl, setImagesUrl] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [name_uk, setName_uk] = useState("");
  const [name_en, setName_en] = useState("");
  const [material_uk, setMaterial_uk] = useState("");
  const [material_en, setMaterial_en] = useState("");
  const [description_uk, setDescription_uk] = useState("");
  const [description_en, setDescription_en] = useState("");
  const [price, setPrice] = useState<string>("");
  // categories
  const [categoryOptions, setCategoryOptions] = useState<{ text: string; value: string }[]>([]);
  const [categoryId, setCategoryId] = useState<string | undefined>();
  // subcategories
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState<{ text: string; value: string }[]>(
    []
  );
  const [subcategoryId, setSubcategoryId] = useState<string | undefined>();
  // sizes
  const [sizes, setSizes] = useState<Size[]>([]);
  const [sizeOptions, setSizeOptions] = useState<(Size & { active: boolean })[]>([]);
  // brands
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandId, setBrandId] = useState<string | undefined>();
  // colors
  const [colorOptions, setColorOptions] = useState<(Color)[]>([]);
  const [colors, setColors] = useState<(Color & { active: boolean })[]>([]);
  // vton
  const [useVton, setUseVton] = useState(false);
  const [vtonCategory, setVtonCategory] = useState<VtonCategory | undefined>();
  const [vtonImage, setVtonImage] = useState<File | null>(null);
  const [vtonImageUrl, setVtonImageUrl] = useState<string | null>(null);
  const [existingVtonImage, setExistingVtonImage] = useState<string | null>(null);
  const [prevSizes, setPrevSizes] = useState<string[]>([]);
  const [prevColors, setPrevColors] = useState<string[]>([]);

  // subcategories
  const filterSubcategories = (categoryId: string) => {
    if (subcategories) {
      setSubcategoryOptions(
        subcategories
          .filter((subcategory) => subcategory.categoryId === categoryId)
          .map((subcategory) => {
            const name = i18n.language === "uk" ? subcategory.name_uk : subcategory.name_en;
            return {
              value: subcategory._id,
              text: name,
            };
          })
          .sort((a, b) => a.text.localeCompare(b.text))
      );
    }
  };

  // initial
  useEffect(() => {
    // categories
    fetchCategories().then((data) => {
      if (data && data.categories) {
        setCategoryOptions(
          data.categories
            .map((category) => {
              const name = i18n.language === "uk" ? category.name_uk : category.name_en;
              let target: string | undefined;
              switch (category.target) {
                case "women":
                  target = t("category.target-short-women");
                  break;
                case "men":
                  target = t("category.target-short-men");
                  break;
                case "kids":
                  target = t("category.target-short-kids");
                  break;
                default:
                  break;
              }

              return {
                value: category._id,
                text: name + (target ? ` (${target})` : ""),
              };
            })
            .sort((a, b) => a.text.localeCompare(b.text))
        );
      }
    });

    // subcategories
    fetchSubcategories().then((data) => {
      if (data && data.subcategories) {
        setSubcategories(data.subcategories);
      }
    });

    // brands
    fetchBrands().then((data) => {
      if (data && data.brands) {
        setBrands(data.brands);
      }
    });

    // sizes
    fetchSizes().then((data) => {
      if (data && data.sizes) {
        setSizes(data.sizes);
      }
    });

    // colors
    fetchColors().then((data) => {
      if (data && data.colors) {
        setColorOptions(data.colors);
        setColors(data.colors.map((color) => ({ active: false, ...color })));
      }
    });

    // fetch product data
    if (id) {
      fetchProductById(id, token).then((data) => {
        if (data && data.success && data.products && data.products.length > 0) {
          const product = data.products[0];
          setName_uk(product.name_uk);
          setName_en(product.name_en);
          setMaterial_uk(product.material_uk || "");
          setMaterial_en(product.material_en || "");
          setDescription_uk(product.description_uk);
          setDescription_en(product.description_en);
          setPrice(product.price.toString());
          setCategoryId(product.categoryId);
          setSubcategoryId(product.subcategoryId);
          setBrandId(product.brandId);
          setExistingImages(product.images);
          setImagesUrl(product.images);
          setUseVton(product.useVton);
          setVtonCategory(product.vtonCategory);
          setExistingVtonImage(product.vtonImage || null);
          setVtonImageUrl(product.vtonImage || null);
          setPrevSizes(product.sizesId);
          setPrevColors(product.colorsId);
					filterSubcategories(product.categoryId);
        } else {
          toast.error(t("edit.error-fetch-product"));
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, id, token]);

  // sizes
  useEffect(() => {
    setSizeOptions(
      sizes
        .filter((size) => size.categoryId === categoryId)
        .map((size) => ({ active: prevSizes.includes(size._id), ...size }))
    );
  }, [categoryId, prevSizes, sizes]);

  // colors
	useEffect(() => {		
    setColors((prev) =>
      prev.map((color) => ({
        ...color,
        active: prevColors.includes(color._id),
      }))
    );
  }, [prevColors, colorOptions]);

  useEffect(() => {
    if (categoryId) {
      filterSubcategories(categoryId);
    }
  }, [categoryId, subcategories]);

  const onSubmitHandler: FormEventHandler = async (event) => {
    event.preventDefault();
    try {
      const sizesId = sizeOptions.filter((size) => size.active).map((size) => size._id);
      const colorsId = colors.filter((color) => color.active).map((color) => color._id);
      if (!sizesId.length) {
        toast.error(t("add.error-size"));
        return;
      } else if (!colorsId.length) {
        toast.error(t("add.error-color"));
        return;
      } else if (!subcategoryId) {
        toast.error(t("add.error-subcategory"));
        return;
      } else if (!brandId) {
        toast.error(t("add.error-brand"));
        return;
      } else if (useVton && !vtonCategory) {
        toast.error(t("add.error-vton-category"));
        return;
      } else if (useVton && !vtonImage && !existingVtonImage) {
        toast.error(t("add.error-vton-image"));
        return;
      }

      const formData = new FormData();

      images.forEach((image, index) => {
        formData.append(`image${index}`, image);
      });

      formData.append("id", id || "");
      formData.append("name_uk", name_uk);
      formData.append("name_en", name_en);
      formData.append("description_uk", description_uk);
      formData.append("description_en", description_en);
      formData.append("material_uk", material_uk);
      formData.append("material_en", material_en);
      formData.append("price", price);
      formData.append("sizesId", JSON.stringify(sizesId));
      formData.append("colorsId", JSON.stringify(colorsId));
      formData.append("subcategoryId", subcategoryId);
      formData.append("brandId", brandId);
      formData.append("recommend", "false");
      formData.append("useVton", JSON.stringify(useVton));
      formData.append("existingImages", JSON.stringify(existingImages));
      if (useVton && vtonImage) {
        formData.append("vtonImage", vtonImage);
      }
      if (useVton && vtonCategory) {
        formData.append("vtonCategory", vtonCategory);
      }
      if (existingVtonImage) {
        formData.append("existingVtonImage", existingVtonImage);
      }

      for (const [key, value] of formData.entries()) {
        console.log(`Key: ${key}, Value:`, value);
      }

      const response = await updateProduct(formData, token);

      if (response.success) {
        toast.success(t("edit.success"));
      } else {
        toast.error(t("edit.error-update"));
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const onLoadImageHandler = async (event: ChangeEvent<HTMLInputElement>, targetIndex: number) => {
    const files = event.target.files;

    if (files && ["image/png", "image/jpeg", "image/jpg"].includes(files[0].type)) {
      if (!files[0] || !event.target.value) return;

      const newFile = files[0];

      if (targetIndex < images.length) {
        // заміна
        setImages(images.map((image, index) => (index === targetIndex ? newFile : image)));
        setImagesUrl(
          imagesUrl.map((url, index) =>
            index === targetIndex ? URL.createObjectURL(newFile) : url
          )
        );
      } else {
        // додаємо
        setImages((images) => [...images, newFile]);
        setImagesUrl([...imagesUrl, URL.createObjectURL(newFile)]);
        setExistingImages([...existingImages, ""]);
        event.target.value = "";
      }
    }
  };

  const onLoadVtonImageHandler = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && ["image/png", "image/jpeg", "image/jpg"].includes(files[0].type)) {
      if (!files[0] || !event.target.value) return;
      const newFile = files[0];
      setVtonImage(newFile);
      setVtonImageUrl(URL.createObjectURL(newFile));
      event.target.value = "";
    }
  };

  const onRemoveImageHandler = (targetIndex: number) => {
    setImages((images) => images.filter((_, index) => index !== targetIndex));
    setImagesUrl((imagesUrl) => imagesUrl.filter((_, index) => index !== targetIndex));
    setExistingImages((existingImages) =>
      existingImages.filter((_, index) => index !== targetIndex)
    );
  };

  const onToggleSizeHandler = (sizeId: string) => {
    setSizeOptions((prev) =>
      produce(prev, (draft) => {
        const size = draft.find((size) => size._id === sizeId);
        if (size) size.active = !size?.active;
      })
    );
  };

  const onToggleColorHandler = (colorId: string) => {
    setColors((prev) =>
      produce(prev, (draft) => {
        const color = draft.find((color) => color._id === colorId);
        if (color) color.active = !color?.active;
      })
    );
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
      <div>
        <p className="mb-2">{t("add.upload-image")}</p>

        {/* //? ------------ IMAGES ------------ */}
        <div className="flex gap-2 flex-wrap">
          {imagesUrl.map((imageUrl, index) => {
            return (
              <div className="relative group w-20 h-20" key={index}>
                <div className="absolute h-full overflow-hidden">
                  <img
                    src={imageUrl}
                    className="absolute w-full h-full group-hover:scale-110 transition duration-300 ease-in-out object-cover"
                    alt=""
                  />
                  <a href={imageUrl} target="_blank">
                    <div className="w-20 h-full bg-gray-500 opacity-0 hover:opacity-5 transition-opacity duration-300"></div>
                  </a>
                </div>

                <div className="w-full h-[70%]"></div>

                <div className="relative h-[30%] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <label htmlFor={`image${index}`}>
                    <div className="flex justify-center items-center w-full h-full bg-gray-200 text-black text-sm font-base cursor-pointer">
                      {t("add.replace-image")}
                    </div>
                  </label>

                  <div
                    onClick={() => onRemoveImageHandler(index)}
                    className="flex justify-center items-center w-full h-full bg-red-600 text-white text-sm font-base cursor-pointer"
                  >
                    {t("add.remove-image")}
                  </div>
                </div>

                <input
                  onChange={(e) => onLoadImageHandler(e, index)}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  id={`image${index}`}
                  hidden
                />
              </div>
            );
          })}

          {/* //? ------------ NEW IMAGE ------------ */}
          <label htmlFor={`image${images.length}`}>
            <img src={assets.upload_area} className="w-20 cursor-pointer" alt="" />
            <input
              onChange={(e) => onLoadImageHandler(e, images.length)}
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              id={`image${images.length}`}
              hidden
            />
          </label>
        </div>
      </div>

      {/* //? ------------ OTHER FIELDS ------------ */}
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8 justify-start">
        {/* //? NAME UK */}
        <div className="w-full max-w-[500px]">
          <p className="mb-2">{t("add.product-name_uk")}</p>
          <input
            onChange={(e) => setName_uk(e.target.value)}
            value={name_uk}
            type="text"
            className="pink-input w-full max-w-[500px] px-3 py-2"
            placeholder={t("add.product-name-placeholder")}
            required
          />
        </div>

        {/* //? NAME EN */}
        <div className="w-full max-w-[500px]">
          <p className="mb-2">{t("add.product-name_en")}</p>
          <input
            onChange={(e) => setName_en(e.target.value)}
            value={name_en}
            type="text"
            className="pink-input w-full max-w-[500px] px-3 py-2"
            placeholder={t("add.product-name-placeholder")}
            required
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8 justify-start">
        {/* //? DESCRIPTION UK */}
        <div className="w-full max-w-[500px]">
          <p className="mb-2">{t("add.product-description_uk")}</p>
          <textarea
            onChange={(e) => setDescription_uk(e.target.value)}
            value={description_uk}
            className="pink-textarea w-full px-3 py-2 min-h-[2.6rem] h-16"
            placeholder={t("add.product-description-placeholder")}
            required
          />
        </div>

        {/* //? DESCRIPTION EN */}
        <div className="w-full max-w-[500px]">
          <p className="mb-2">{t("add.product-description_en")}</p>
          <textarea
            onChange={(e) => setDescription_en(e.target.value)}
            value={description_en}
            className="pink-textarea w-full px-3 py-2 min-h-[2.6rem] h-16"
            placeholder={t("add.product-description-placeholder")}
            required
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8 justify-start">
        {/* //? MATERIALS UK */}
        <div className="w-full max-w-[500px]">
          <p className="mb-2">{t("add.product-material_uk")}</p>
          <textarea
            onChange={(e) => setMaterial_uk(e.target.value)}
            value={material_uk}
            className="pink-textarea w-full px-3 py-2 min-h-[2.6rem] h-16"
            placeholder={t("add.product-material-placeholder")}
            required
          />
        </div>

        {/* //? MATERIALS EN */}
        <div className="w-full max-w-[500px]">
          <p className="mb-2">{t("add.product-material_en")}</p>
          <textarea
            onChange={(e) => setMaterial_en(e.target.value)}
            value={material_en}
            className="pink-textarea w-full px-3 py-2 min-h-[2.6rem] h-16"
            placeholder={t("add.product-material-placeholder")}
            required
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8 max-w-[1032px]">
        {/* //? CATEGORY */}
        <div className="flex flex-col justify-end w-full">
          <p className="mb-2">{t("add.product-category.label")}</p>
          <select
            onChange={(e) => {
              setCategoryId(e.target.value);
              setSubcategoryId("");
              filterSubcategories(e.target.value);
            }}
            value={categoryId}
            className={`pink-select w-full px-3 py-[calc(0.5rem+1px)] cursor-pointer ${
              categoryId ? "" : "placeholder"
            }`}
            required
          >
            <option value="" className="placeholder">
              {t("add.product-category.placeholder")}
            </option>
            {categoryOptions.map((item, index) => (
              <option key={index} value={item.value}>
                {item.text}
              </option>
            ))}
          </select>
        </div>

        {/* //? SUBCATEGORY */}
        <div className="flex flex-col justify-end w-full">
          {" "}
          <p className="mb-2">{t("add.product-subcategory.label")}</p>
          <select
            onChange={(e) => setSubcategoryId(e.target.value)}
            value={subcategoryId}
            className={`pink-select w-full px-3 py-[calc(0.5rem+1px)] cursor-pointer ${
              subcategoryId ? "" : "placeholder"
            }`}
            disabled={categoryId ? false : true}
            required
          >
            <option value="" className="placeholder">
              {t("add.product-subcategory.placeholder")}
            </option>
            {subcategoryOptions.map((item, index) => (
              <option key={index} value={item.value}>
                {item.text}
              </option>
            ))}
          </select>
        </div>

        {/* //? BRAND */}
        <div className="flex flex-col justify-end w-full">
          {" "}
          <p className="mb-2">{t("add.product-brand.label")}</p>
          <select
            onChange={(e) => setBrandId(e.target.value)}
            value={brandId}
            className={`pink-select w-full px-3 py-[calc(0.5rem+1px)] cursor-pointer ${
              brandId ? "" : "placeholder"
            }`}
            required
          >
            <option value="" className="placeholder">
              {t("add.product-brand.placeholder")}
            </option>
            {brands.map((brand, index) => (
              <option key={index} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {/* //? PRICE */}
        <div className="flex flex-col justify-end w-full">
          {" "}
          <p className="mb-2">{t("add.product-price")}</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price ? price : ""}
            type="number"
            className="pink-input w-full px-3 py-2 no-controls"
            placeholder="0"
            required
          />
        </div>
      </div>

      <div>
        {/* // ? ------------ SIZES ------------ */}
        <p className={`mb-2 ${sizeOptions.length ? "" : "hidden"}`}>{t("add.product-sizes")}</p>
        <div className="flex gap-3 flex-wrap">
          {sizeOptions.map((size, index) => (
            <div key={index} onClick={() => onToggleSizeHandler(size._id)}>
              <p
                className={`${
                  size.active ? "bg-pink-200" : "bg-slate-200"
                } px-3 py-1 cursor-pointer select-none`}
              >
                {size.size}
              </p>
            </div>
          ))}
          {/* MANAGE
          <ManageButton /> */}
        </div>
      </div>

      <div>
        {/* // ? ------------ COLORS ------------ */}
        <p className="mb-2">{t("add.product-colors")}</p>
        <div className="flex gap-3 flex-wrap">
          {colors.map((color, index) => (
            <label
              key={index}
              className="flex items-center gap-2 cursor-pointer"
              htmlFor={`color${color._id}`}
            >
              <button
                id={`color${color._id}`}
                type="button"
                className={`w-6 h-6 rounded-full border border-gray-400 ${
                  color.active
                    ? "outline outline-2 outline-[#c568a5] outline-offset-1"
                    : "outline-none"
                }`}
                onClick={() => onToggleColorHandler(color._id)}
                style={{
                  backgroundColor: color.hex,
                }}
              />
              <span>{i18n.language === "uk" ? color.name_uk : color.name_en}</span>
            </label>
          ))}
          {/* MANAGE
          <ManageButton /> */}
        </div>
      </div>

      {/* //? VTON */}
      <div className="mt-2">
        <label className="flex gap-2 cursor-pointer" htmlFor="usevton">
          <input
            onChange={() => setUseVton((prev) => !prev)}
            checked={useVton}
            className="pink-input h-[1rem] w-[1rem] my-auto cursor-pointer"
            type="checkbox"
            id="usevton"
          />
          {t("add.use-vton")}
        </label>
      </div>

      {useVton && (
        // ? VTON CATEGORY
        <div className="flex flex-col gap-3">
          <div className="flex flex-col justify-end w-full max-w-[500px]">
            <p className="mb-2">{t("add.vton-category.label")}</p>
            <select
              onChange={(e) => setVtonCategory(e.target.value as VtonCategory)}
              value={vtonCategory}
              className={`pink-select w-full px-3 py-[calc(0.5rem+1px)] cursor-pointer ${
                vtonCategory ? "" : "placeholder"
              }`}
              required
            >
              <option value="" className="placeholder">
                {t("add.vton-category.placeholder")}
              </option>
              {Object.values(VtonCategory).map((category, index) => (
                <option key={index} value={category}>
                  {t(`vton-category.${category}`)}
                </option>
              ))}
            </select>
          </div>

          {/* //? VTON IMAGE */}
          <div>
            <p className="mb-2">{t("add.upload-vton-image")}</p>
            <div className="flex gap-2 flex-wrap">
              {vtonImageUrl ? (
                <div className="relative group w-20 h-20">
                  <div className="absolute h-full overflow-hidden">
                    <img
                      src={vtonImageUrl}
                      className="absolute w-full h-full group-hover:scale-110 transition duration-300 ease-in-out object-cover"
                      alt=""
                    />
                    <a href={vtonImageUrl} target="_blank" rel="noopener noreferrer">
                      <div className="w-20 h-full bg-gray-500 opacity-0 hover:opacity-5 transition-opacity duration-300"></div>
                    </a>
                  </div>
                  <div className="w-full h-[70%]"></div>
                  <div className="relative h-[30%] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <label htmlFor="vtonImage">
                      <div className="flex justify-center items-center w-full h-full bg-gray-200 text-black text-sm font-base cursor-pointer">
                        {t("add.replace-image")}
                      </div>
                    </label>
                  </div>
                  <input
                    onChange={onLoadVtonImageHandler}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    id="vtonImage"
                    hidden
                  />
                </div>
              ) : (
                // NO IMAGE
                <label htmlFor="vtonImage">
                  <img src={assets.upload_area} className="w-20 cursor-pointer" alt="" />
                  <input
                    onChange={onLoadVtonImageHandler}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    id="vtonImage"
                    hidden
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      )}

      <button className="w-28 py-3 mt-4 bg-black text-white" type="submit">
        {t("edit.update-btn")}
      </button>
    </form>
  );
};

export default Edit;
