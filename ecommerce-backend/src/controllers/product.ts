import { Request } from "express";
import { catchAsyncErrors } from "../middlewares/error";
import {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types";
import { Product } from "../models/product";
import ErrorHandler from "../utils/utility-class";
import { findAverageRatings, invalidateCache } from "../utils/features";
import { HttpStatus } from "../http-status.enum";
import cloudinary from 'cloudinary'
import fs from 'fs'
import { Review } from "../models/review";
import { User } from "../models/user";
import { redis } from "../../server";

// import { faker } from "@faker-js/faker";


// Revalidate on New,Update,Delete Product & on New Order
export const getlatestProducts = catchAsyncErrors(async (req, res, next) => {
  let products

  products = await redis.get("latest-products")

  if (products)
    products = JSON.parse(products);
  else {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    await redis.set("latest-products", JSON.stringify(products));
  }

  return res.status(HttpStatus.OK).json({
    success: true,
    products,
  });
});

// Revalidate on New,Update,Delete Product & on New Order
export const getAllCategories = catchAsyncErrors(async (req, res, next) => {
  let categories;

  categories = await redis.get("categories")


  if (categories)
    categories = JSON.parse(categories);
  else {
    categories = await Product.distinct("category");
    await redis.set("categories", JSON.stringify(categories));
  }

  return res.status(HttpStatus.OK).json({
    success: true,
    categories,
  });
});

// Revalidate on New,Update,Delete Product & on New Order
export const getAdminProducts = catchAsyncErrors(async (req, res, next) => {
  let products;

  products = await redis.get("all-products")

  if (products)
    products = JSON.parse(products);
  else {
    products = await Product.find({});
    await redis.set("all-products", JSON.stringify(products));
  }

  return res.status(HttpStatus.OK).json({
    success: true,
    products,
  });
});

export const getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  let product;

  const id = req.params.id;

  product = await redis.get(`product-${id}`)

  if (product)
    product = JSON.parse(product);
  else {
    product = await Product.findById(id);

    if (!product) return next(new ErrorHandler("Product Not Found", HttpStatus.NOT_FOUND));

    await redis.set(`product-${id}`, JSON.stringify(product));
  }

  return res.status(HttpStatus.OK).json({
    success: true,
    product,
  });
});


export const newProduct = catchAsyncErrors(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    // Log body and files to check
    // console.log('Files:', req.files); // Should show an array of file objects
    // console.log('Body:', req.body);   // Should show other fields (name, price, etc.)

    const { name, price, stock, category, description } = req.body;

    const photos = req.files as Express.Multer.File[] | undefined;

    // console.log('Photos received for upload:', photos);


    if (!photos) return next(new ErrorHandler("Please add Photo", HttpStatus.BAD_REQUEST));

    if (photos.length < 1)
      return next(new ErrorHandler("Please add atleast one Photo", HttpStatus.BAD_REQUEST));

    if (photos.length > 5)
      return next(new ErrorHandler("You can only upload 5 Photos", HttpStatus.BAD_REQUEST));

    if (!name || !price || !stock || !category || !description) {
      return next(new ErrorHandler("Please enter All Fields", HttpStatus.BAD_REQUEST));
    }

    // Upload Here

    // const photosURL = await uploadToCloudinary(photos);

    let photosURL = [];
    try {
      // Attempt to upload photos
      // photosURL = await uploadToCloudinary(photos);
      for (let i = 0; i < photos.length; i++) {
        const result = await cloudinary.v2.uploader.upload(photos[i].path, {
          folder: 'products',
          resource_type: 'image',
        })

        // Add the URL of the uploaded image to the photosURL array
        photosURL.push({ public_id: result.public_id, url: result.secure_url });

        fs.unlinkSync(photos[i].path)
      }
    } catch (error) {
      // Log the error and return a proper message
      console.error('Cloudinary Upload Error:', error);
      return next(new ErrorHandler("Failed to upload photos", HttpStatus.INTERNAL_SERVER_ERROR));
    }


    await Product.create({
      name,
      price,
      stock,
      category: category.toLowerCase(),
      description,
      photos: photosURL,
    });

    invalidateCache({ product: true, admin: true });

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Product Created Successfully",
    });
  }
);


export const updateProduct = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, stock, category, description } = req.body;
  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("Product Not Found", HttpStatus.NOT_FOUND));

  // Handle photos array for the update
  const photos = req.files as Express.Multer.File[] | undefined;

  if (photos && photos.length > 0) {
    // Clear existing images from Cloudinary and DocumentArray
    for (const existingPhoto of product.photos) {
      await cloudinary.v2.uploader.destroy(existingPhoto.public_id);
    }
    product.photos.splice(0, product.photos.length); // Clear existing photos in the DocumentArray

    // Upload new photos to Cloudinary and add to DocumentArray
    for (let i = 0; i < photos.length; i++) {
      const result = await cloudinary.v2.uploader.upload(photos[i].path, {
        folder: "products",
        resource_type: "image",
      });

      // Push new photo into the DocumentArray with required structure
      product.photos.push({
        public_id: result.public_id,
        url: result.secure_url,
      });

      // Delete temporary uploaded files from server
      fs.unlinkSync(photos[i].path);
    }
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;
  if (description) product.description = description;

  await product.save();

  invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(HttpStatus.OK).json({
    success: true,
    message: "Product Updated Successfully",
  });
});

export const deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product Not Found", HttpStatus.NOT_FOUND));

  // Deleting Images From Cloudinary
  for (let i = 0; i < product.photos.length; i++) {
    await cloudinary.v2.uploader.destroy(product.photos[i].public_id)
  }

  await product.deleteOne();

  invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(HttpStatus.OK).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

export const getAllProducts = catchAsyncErrors(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, category, price } = req.query;

    const page = Number(req.query.page) || 1;

    const key = `products-${search}-${sort}-${category}-${price}-${page}`

    let products;
    let totalPage;

    const cachedData = await redis.get(key)
    if (cachedData) {
      const productsData = JSON.parse(cachedData)
      totalPage = productsData.totalPage
      products = productsData.products
    } else {
      // 1,2,3,4,5,6,7,8
      // 9,10,11,12,13,14,15,16
      // 17,18,19,20,21,22,23,24
      const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
      const skip = (page - 1) * limit;

      const baseQuery: BaseQuery = {};

      if (search)
        baseQuery.name = {
          $regex: search,
          $options: "i",
        };

      if (price)
        baseQuery.price = {
          $lte: Number(price),
        };

      if (category) baseQuery.category = category;

      const productsPromise = Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .limit(limit)
        .skip(skip);

      const [productsFetched, filteredOnlyProduct] = await Promise.all([
        productsPromise,
        Product.find(baseQuery),
      ]);

      products = productsFetched

      totalPage = Math.ceil(filteredOnlyProduct.length / limit);

      await redis.setex(key, 30, JSON.stringify({ products, totalPage }))
    }

    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  }
);

export const allReviewsOfProduct = catchAsyncErrors(async (req, res, next) => {

  let reviews;

  const key = `reviews-${req.params.id}`;

  reviews = await redis.get(key);

  if (reviews) reviews = JSON.parse(reviews);
  else {
    reviews = await Review.find({
      product: req.params.id,
    })
      .populate("user", "name photo")
      .sort({ updatedAt: -1 });

    // await redis.setex(key, redisTTL, JSON.stringify(reviews));
    await redis.set(key, JSON.stringify(reviews));
  }

  return res.status(HttpStatus.OK).json({
    success: true,
    reviews,
  });
});

export const newReview = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.query.id);

  if (!user) return next(new ErrorHandler("Not Logged In", HttpStatus.NOT_FOUND));

  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product Not Found", HttpStatus.NOT_FOUND));

  const { comment, rating } = req.body;

  const alreadyReviewed = await Review.findOne({
    user: user._id,
    product: product._id,
  });

  if (alreadyReviewed) {
    alreadyReviewed.comment = comment;
    alreadyReviewed.rating = rating;

    await alreadyReviewed.save();
  } else {
    await Review.create({
      comment,
      rating,
      user: user._id,
      product: product._id,
    });
  }

  const { ratings, numOfReviews } = await findAverageRatings(product._id);

  product.ratings = ratings;
  product.numOfReviews = numOfReviews;

  await product.save();

  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
    review: true,
  });

  return res.status(alreadyReviewed ? HttpStatus.OK : HttpStatus.CREATED).json({
    success: true,
    message: alreadyReviewed ? "Review Update" : "Review Added",
  });
});

export const deleteReview = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.query.id);

  if (!user) return next(new ErrorHandler("Not Logged In", HttpStatus.NOT_FOUND));

  const review = await Review.findById(req.params.id);

  if (!review) return next(new ErrorHandler("Review Not Found", HttpStatus.NOT_FOUND));

  const isAuthenticUser = review.user.toString() === user._id.toString();

  if (!isAuthenticUser) return next(new ErrorHandler("Not Authorized", HttpStatus.UNAUTHORIZED));

  await review.deleteOne();

  const product = await Product.findById(review.product);

  if (!product) return next(new ErrorHandler("Product Not Found", HttpStatus.NOT_FOUND));

  const { ratings, numOfReviews } = await findAverageRatings(product._id);

  product.ratings = ratings;
  product.numOfReviews = numOfReviews;

  await product.save();

  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(HttpStatus.OK).json({
    success: true,
    message: "Review Deleted",
  });
});

// const generateRandomProducts = async (count: number = 10) => {
//   const products = [];

//   for (let i = 0; i < count; i++) {
//     const product = {
//       name: faker.commerce.productName(),
//       photo: "uploads\\2c9d22da-7d86-4cf3-a46b-056f068e2723.jpg",
//       price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
//       stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
//       category: faker.commerce.department(),
//       createdAt: new Date(faker.date.past()),
//       updatedAt: new Date(faker.date.recent()),
//       __v: 0,
//     };

//     products.push(product);
//   }

//   await Product.create(products);

//   console.log({ succecss: true });
// };
// generateRandomProducts(40)

// const deleteRandomsProducts = async (count: number = 10) => {
//   const products = await Product.find({}).skip(2);

//   for (let i = 0; i < products.length; i++) {
//     const product = products[i];
//     await product.deleteOne();
//   }

//   console.log({ succecss: true });
// };
// deleteRandomsProducts(40)