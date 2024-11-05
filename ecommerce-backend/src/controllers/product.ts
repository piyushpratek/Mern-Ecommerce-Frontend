import { Request } from "express";
import { catchAsyncErrors } from "../middlewares/error";
import {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types";
import { Product } from "../models/product";
import ErrorHandler from "../utils/utility-class";
import { rm } from "fs";
import { myCache } from "../app";
import { invalidateCache, sleep } from "../utils/features";
import { HttpStatus } from "../http-status.enum";
import cloudinary from 'cloudinary'
import fs from 'fs'

// import { faker } from "@faker-js/faker";


// Revalidate on New,Update,Delete Product & on New Order
export const getlatestProducts = catchAsyncErrors(async (req, res, next) => {
  let products;

  if (myCache.has("latest-products"))
    products = JSON.parse(myCache.get("latest-products") as string);
  else {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    myCache.set("latest-products", JSON.stringify(products));
  }

  return res.status(HttpStatus.OK).json({
    success: true,
    products,
  });
});

// Revalidate on New,Update,Delete Product & on New Order
export const getAllCategories = catchAsyncErrors(async (req, res, next) => {
  let categories;

  if (myCache.has("categories"))
    categories = JSON.parse(myCache.get("categories") as string);
  else {
    categories = await Product.distinct("category");
    myCache.set("categories", JSON.stringify(categories));
  }

  return res.status(HttpStatus.OK).json({
    success: true,
    categories,
  });
});

// Revalidate on New,Update,Delete Product & on New Order
export const getAdminProducts = catchAsyncErrors(async (req, res, next) => {
  let products;
  if (myCache.has("all-products"))
    products = JSON.parse(myCache.get("all-products") as string);
  else {
    products = await Product.find({});
    myCache.set("all-products", JSON.stringify(products));
  }

  return res.status(HttpStatus.OK).json({
    success: true,
    products,
  });
});

export const getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  let product;
  const id = req.params.id;
  if (myCache.has(`product-${id}`))
    product = JSON.parse(myCache.get(`product-${id}`) as string);
  else {
    product = await Product.findById(id);

    if (!product) return next(new ErrorHandler("Product Not Found", HttpStatus.NOT_FOUND));

    myCache.set(`product-${id}`, JSON.stringify(product));
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

    const { name, price, stock, category } = req.body;

    const photos = req.files as Express.Multer.File[] | undefined;

    // console.log('Photos received for upload:', photos);


    if (!photos) return next(new ErrorHandler("Please add Photo", HttpStatus.BAD_REQUEST));

    if (photos.length < 1)
      return next(new ErrorHandler("Please add atleast one Photo", HttpStatus.BAD_REQUEST));

    if (photos.length > 5)
      return next(new ErrorHandler("You can only upload 5 Photos", HttpStatus.BAD_REQUEST));

    if (!name || !price || !stock || !category) {
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
  const { name, price, stock, category } = req.body;
  const photo = req.file;
  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("Product Not Found", HttpStatus.NOT_FOUND));

  if (photo) {
    rm(product.photo!, () => {
      console.log("Old Photo Deleted");
    });
    product.photo = photo.path;
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;

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

  rm(product.photo!, () => {
    console.log("Product Photo Deleted");
  });

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

    const [products, filteredOnlyProduct] = await Promise.all([
      productsPromise,
      Product.find(baseQuery),
    ]);

    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);

    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  }
);

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