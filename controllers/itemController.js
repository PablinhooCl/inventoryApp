const Item = require('../models/item');
const ItemInstance = require('../models/itemInstance');
const Category = require('../models/category');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require("express-validator");
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg');
    }
});

const upload = multer({ storage: storage });

exports.index = asyncHandler(async (req, res, next) => {
    const [
        numItems,
        numItemsPrice,
        numItemInstanceStock,
        numItemsInstance,
        numCategory
    ] = await Promise.all([
        Item.countDocuments({}).exec(),
        Item.countDocuments({ price: { $gt: 0}}).exec(),
        ItemInstance.countDocuments({}).exec(),
        ItemInstance.countDocuments({ stock: { $gt: 0 } }).exec(),
        Category.countDocuments().exec()
    ])
    res.render('index', {
        title: 'Catalog store',
        item_count: numItems,
        item_price_count: numItemsPrice,
        item_instance_count: numItemsInstance,
        itemInstance_stock_count: numItemInstanceStock,
        category_count: numCategory

    });
})

exports.item_list = asyncHandler(async (req, res, next) => {
    const allItems = await Item.find({}, 'name item price')
    .sort({ name: 1 })
    .populate('name')
    .exec();

    res.render("item_list", { title: 'Item List', item_list: allItems })
});

exports.item_detail = asyncHandler(async (req, res, next) => {
    const [item, itemInstances] = await Promise.all([
        Item.findById(req.params.id).populate('category').exec(),
        ItemInstance.find({ item: req.params.id }).exec(),
    ])

    if ( item === null){
        const err = new Error('Item not found')
        err.status= 404;
        return next(err)
    }

    res.render('item_detail', {
        title: item.name,
        item: item,
        item_instance: itemInstances
    })
});

exports.item_create_get = asyncHandler(async (req, res, next) => {
    try {
        const allCategories = await Category.find().sort({ name: 1 }).exec();

        res.render('item_form', {
            title: 'Create Item',
            categories: allCategories,
        });
    } catch (error) {
        return next(error);
    }
});

exports.item_create_post = [
    upload.array('images', 5), 

    (req, res, next) => {
        if (!Array.isArray(req.body.category)){
            req.body.category =
                typeof req.body.category === "undefined" ? [] : [req.body.category]
        }
        next();
    },
    body('name', 'Name must not be empty.')
        .trim()
        .isLength({ min: 1})
        .escape(),
    body('price', 'Price must be entered.')
        .trim()
        .isNumeric().withMessage('Must be a number.')
        .custom(value => {
            if (parseFloat(value) <= 0) {
                throw new Error("Price must be greater than 0.");
            }
    
            return true; 
        })
        .escape(),
        body("category.*").escape(),

        asyncHandler(async (req, res, next) => {
            const errors = validationResult(req);

            const item = new Item({
                name: req.body.name,
                price: req.body.price,
                category: req.body.category,
                images: req.files.map(file => `/uploads/${file.filename}`),
            })

            console.log(req.body);

            if (!errors.isEmpty()) {

                const allCategories = await Category.find().sort({ name: 1 }).exec();
                allCategories.forEach((category) => {
                    if (req.body.category.includes(category._id.toString())) {
                        category.checked = 'true';
                    }
                });

                res.render("item_form", {
                    title: 'Create Item',
                    categories: allCategories,
                    price: item.price,
                    errors: errors.array()
                })
            } else{
                await item.save()
                res.redirect(`/catalog/items/${item._id}`);

            }
        })
];

exports.item_delete_get = asyncHandler(async (req, res, next) => {
    const [item, allItemsWithItemInstance] = await Promise.all([
        Item.findById(req.params.id).exec(),
        ItemInstance.find({ item: req.params.id }, 'name').exec()

    ])
    console.log(allItemsWithItemInstance)

    if ( item === null ){
        res.redirect('/catalog/items')
    }

    res.render('item_delete', {
        title: 'Delete Item',
        item: item,
        item_instance: allItemsWithItemInstance,
    })
});

exports.item_delete_post = asyncHandler(async (req, res, next) => {
    const [item, allItemsWithItemInstance] = await Promise.all([
        Item.findById(req.params.id).exec(),
        ItemInstance.find({ item: req.params.id }, 'item').exec()

    ])
    console.log(allItemsWithItemInstance)
    if ( allItemsWithItemInstance.length > 0 ){
        res.render('item_delete', {
            title: 'Delete Item',
            item: item,
            item_instance: allItemsWithItemInstance,
        })
        return
    } else {
        await Item.findByIdAndDelete(req.body.itemid)
        res.redirect('/catalog/items')
    }
});

exports.item_update_get = asyncHandler(async (req, res, next) => {
    const [ item, allCategories ] = await Promise.all([
        Item.findById( req.params.id ).exec(),
        Category.find().sort({ name: 1 }).exec()
    ])

    if ( item === null) {
        const err = new Error('Item not found');
        err.status= 404;
        return next(err)
    }

    const itemCategories = Array.isArray(item.category) ? item.category : [item.category];

    allCategories.forEach((category) => {
        if (itemCategories.includes(category._id.toString())) {
            category.checked = 'true';
        }
    })

    res.render('item_form', {
        title: 'Update Item',
        category: allCategories,
        item: item,
    })
});

exports.item_update_post = [ 
    (req, res, next) => {
        if(!Array.isArray(req.body.category)){
            req.body.category =
             typeof req.body.category === 'undefined' ? [] : [req.body.category]
        }
        next()
    },

    body('name', 'Name must not be empty')
        .trim()
        .isLength({ min : 1 })
        .escape(),
    body('category.*').escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const item = new Item({
            name: req.body.name,
            price: req.body.price,
            category: typeof req.body.category === 'undefined' ? [] : req.body.category,
            _id: req.params.id
        })

        if( !errors.isEmpty()){
            const allCategories = await Category.find().sort({ name: 1 }).exec();

            for (const category of allCategories) {
                if ( item.category.indexOf(category._id) > -1){
                    category.checked = 'true'
                }
            }
            
            res.render('item_form', {
                title: 'Update Item',
                category: allCategories,
                item: item,
                errors: errors.array(),
            })
            return
        } else {
            const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {})
            res.redirect(updatedItem.url)
        }
    })
]
