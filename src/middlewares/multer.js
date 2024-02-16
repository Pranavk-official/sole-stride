const multer = require( 'multer' )

const storage = multer.diskStorage({
    destination : ( req, file, cb ) => {
        cb( null, './public/uploads/images/')
    },
    filename : ( req, file, cb ) => {


        const uniqueName = Date.now() + '-' + file.originalname
        cb( null, uniqueName )
    }
})

const categoryStorage = multer.diskStorage({
    destination : ( req, file, cb ) => {
        cb( null, './public/uploads/category-images/')
    },
    filename : ( req, file, cb ) => {

        const filename = file.originalname
        const uniqueName = Date.now() + '-' + filename
        cb( null, uniqueName )
    }
})

const profileStorage = multer.diskStorage({
    destination : ( req, file, cb ) => {
        cb( null, './public/uploads/profile-images/')
    },
    filename : ( req, file, cb ) => {
        const filename = file.originalname
        const uniqueName = Date.now() + '-' + filename
        cb( null, uniqueName )
    }
})

const productStorage = multer.diskStorage({
    destination : ( req, file, cb ) => {
        cb( null, './public/uploads/product-images/')
    },
    filename : ( req, file, cb ) => {
        const uniqueName = Date.now() + '-' + file.originalname
        cb( null, uniqueName )
    }
})
const bannerStorage = multer.diskStorage({
    destination : ( req, file, cb ) => {
        cb( null, './public/uploads/banners/')
    },
    filename : ( req, file, cb ) => {
        const uniqueName = Date.now() + '-' + file.originalname
        cb( null, uniqueName )
    }
})


module.exports  = {
    upload: multer({storage : storage}),
    categoryUpload: multer({storage : categoryStorage}),
    bannerUpload: multer({storage : bannerStorage}),
    profileUpload: multer({storage : profileStorage}),
    productUpload: multer({storage : productStorage}),
}