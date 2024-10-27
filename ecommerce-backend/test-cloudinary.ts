console.log("hello")
import multer from 'multer'
// import cloudinary from 'cloudinary'
import { v2 as cloudinary } from 'cloudinary';

import { CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from './src/config/config';

export const uploadMulter = multer({ dest: 'uploads/' })

cloudinary.config({
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    timeout: 6000
});
console.log(CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET);


const main = async () => {
    const image = `C:\\Users\\piyus\\OneDrive\\Documents\\githubrepo\\Mern-Ecommerce-2024\\ecommerce-backend\\uploads\\sample1.png`
    // const image = `https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg`
    try {
        const result = await cloudinary.uploader.upload(image, {
            // public_id: 'sample',
            // use_filename: true,
            // timeout: 6000000,
            folder: 'products',
            resource_type: 'image',
        }, function (error, result) {
            console.log(error);

        })
        console.log('Upload result:', result);

    } catch (error) {
        console.log('Upload error:', error);
    }

}
main()