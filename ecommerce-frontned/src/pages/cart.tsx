// import axios from "axios";
import { useEffect, useState } from "react";
import { VscError } from "react-icons/vsc";
// import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CartItem from "../components/Cart-Item";
// import CartItemCard from "../components/cart-item";
// import {
//   addToCart,
//   calculatePrice,
//   discountApplied,
//   removeCartItem,
// } from "../redux/reducer/cartReducer";
// import { RootState, server } from "../redux/store";
// import { CartItem } from "../types/types";

const cartItems = [
  {
    productId: "example",
    photo: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wfGVufDB8fDB8fHww",
    name: "macBook",
    price: 30000,
    quantity: 4,
    stock: 10
  }
]
const subtotal = 4000
const tax = Math.round(subtotal * 0.18)
const shippingCharges = 200
const discount = 2000
const total = subtotal + tax + shippingCharges

const Cart = () => {
  // const { cartItems, subtotal, tax, total, shippingCharges, discount } =
  //   useSelector((state: RootState) => state.cartReducer);
  // const dispatch = useDispatch();

  const [couponCode, setCouponCode] = useState<string>("");
  const [isValidCouponCode, setIsValidCouponCode] = useState<boolean>(false);

  // const incrementHandler = (cartItem: CartItem) => {
  //   if (cartItem.quantity >= cartItem.stock) return;

  //   dispatch(addToCart({ ...cartItem, quantity: cartItem.quantity + 1 }));
  // };
  // const decrementHandler = (cartItem: CartItem) => {
  //   if (cartItem.quantity <= 1) return;

  //   dispatch(addToCart({ ...cartItem, quantity: cartItem.quantity - 1 }));
  // };
  // const removeHandler = (productId: string) => {
  //   dispatch(removeCartItem(productId));
  // };
  useEffect(() => {
    // const { token: cancelToken, cancel } = axios.CancelToken.source();

    const timeOutID = setTimeout(() => {
      // axios
      //   .get(`${server}/api/v1/payment/discount?coupon=${couponCode}`, {
      //     cancelToken,
      //   })
      //   .then((res) => {
      //     dispatch(discountApplied(res.data.discount));
      //     setIsValidCouponCode(true);
      //     dispatch(calculatePrice());
      //   })
      //   .catch(() => {
      //     dispatch(discountApplied(0));
      //     setIsValidCouponCode(false);
      //     dispatch(calculatePrice());
      //   });
    }, 1000);

    return () => {
      clearTimeout(timeOutID);
      // cancel();
      setIsValidCouponCode(false);
    };
  }, [couponCode]);

  // useEffect(() => {
  //   dispatch(calculatePrice());
  // }, [cartItems]);

  return (
    <div className="cart">
      <main>
        {cartItems.length > 0 ? (
          cartItems.map((i, idx) => (
            <CartItem
              // incrementHandler={incrementHandler}
              // decrementHandler={decrementHandler}
              // removeHandler={removeHandler}
              key={idx}
              cartItem={i}
            />
          ))
        ) : (
          <h1>No Items Added</h1>
        )}
      </main>
      <aside>
        <p>Subtotal: ₹{subtotal}</p>
        <p>Shipping Charges: ₹{shippingCharges}</p>
        <p>Tax: ₹{tax}</p>
        <p>
          Discount: <em className="red"> - ₹{discount}</em>
        </p>
        <p>
          <b>Total: ₹{total}</b>
        </p>

        <input
          type="text"
          placeholder="Coupon Code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />

        {couponCode &&
          (isValidCouponCode ? (
            <span className="green">
              ₹{discount} off using the <code>{couponCode}</code>
            </span>
          ) : (
            <span className="red">
              Invalid Coupon <VscError />
            </span>
          ))}

        {cartItems.length > 0 && <Link to="/shipping">Checkout</Link>}
      </aside>
    </div>
  );
};

export default Cart;
