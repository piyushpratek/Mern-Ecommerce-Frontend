import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { useNewProductMutation } from "../../../redux/api/productAPI";
import { RootState, useAppSelector } from "../../../redux/store";
import { responseToast } from "../../../utils/features";
import { useFileHandler } from "6pp";

const NewProduct = () => {
  const { user } = useAppSelector((state: RootState) => state.userReducer);

  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [price, setPrice] = useState<number>(1000);
  const [stock, setStock] = useState<number>(1);

  const [newProduct] = useNewProductMutation();
  const navigate = useNavigate();

  const photos = useFileHandler("multiple", 6, 5)

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !price || stock < 0 || !category) return;

    if (!photos.file || photos.file.length === 0) return;

    const formData = new FormData();

    formData.set("name", name);
    formData.set("price", price.toString());
    formData.set("stock", stock.toString());
    formData.set("category", category);

    photos.file.forEach((file) => {
      formData.append("photos", file);
    });

    const res = await newProduct({ id: user!._id, formData });

    responseToast(res, navigate, "/admin/product");
  };

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        <article>
          <form onSubmit={submitHandler}>
            <h2>New Product</h2>
            <div>
              <label>Name</label>
              <input
                required
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label>Price</label>
              <input
                required
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Stock</label>
              <input
                required
                type="number"
                placeholder="Stock"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
              />
            </div>

            <div>
              <label>Category</label>
              <input
                required
                type="text"
                placeholder="eg. laptop, camera etc"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div>
              <label>Photo</label>
              <input required type="file" multiple onChange={photos.changeHandler} />
            </div>

            {photos.error && <p>{photos.error}</p>}

            {photos.preview &&
              photos.preview.map((img, i) => (
                <img key={i} src={img} alt="New Image" />
              ))}

            <button type="submit">Create</button>
          </form>
        </article>
      </main>
    </div>
  );
};

export default NewProduct;
