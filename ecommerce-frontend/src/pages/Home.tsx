// import toast from "react-hot-toast";
// import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import ProductCard from "../components/Product-Card";
// import { Skeleton } from "../components/loader";
// import ProductCard from "../components/product-card";
// import { useLatestProductsQuery } from "../redux/api/productAPI";
// import { addToCart } from "../redux/reducer/cartReducer";
// import { CartItem } from "../types/types";

const Home = () => {
  // const { data, isLoading, isError } = useLatestProductsQuery("");

  // const dispatch = useDispatch();

  const addToCartHandler = () => { }

  // const addToCartHandler = (cartItem: CartItem) => {
  //   if (cartItem.stock < 1) return toast.error("Out of Stock");
  //   dispatch(addToCart(cartItem));
  //   toast.success("Added to cart");
  // };

  // if (isError) toast.error("Cannot Fetch the Products");

  return (
    <div className="home">
      <section></section>

      <h1>
        Latest Products
        <Link to="/search" className="findmore">
          More
        </Link>
      </h1>

      <main>
        <ProductCard
          // key={i._id}
          productId="example"
          name="Macbook"
          price={450000}
          stock={52}
          handler={addToCartHandler}
          photo="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wfGVufDB8fDB8fHww"
        />

        {/* {isLoading ? (
          <Skeleton width="80vw" />
        ) : (
          data?.products.map((i) => (
            <ProductCard
              key={i._id}
              productId={i._id}
              name={i.name}
              price={i.price}
              stock={i.stock}
              handler={addToCartHandler}
              photo={i.photo}
            />
          ))
        )} */}
      </main>
    </div>
  );
};

export default Home;
