const ItemInstance = require('../models/itemInstance');
const Item = require('../models/item');

const mongoose= require('mongoose');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require("express-validator");


exports.itemInstance_list = asyncHandler(async (req, res, next) => {
    const allItemInstances = await ItemInstance.find().populate('item').exec();

    res.render('itemInstance_list', {
        name: 'Item Instance List',
        itemInstance_list: allItemInstances,
    })
});

exports.itemInstance_detail = asyncHandler(async (req, res, next) => {
    const itemInstance = await ItemInstance.findById(req.params.id)
    .populate('item')
    .exec();

    if (itemInstance === null){
        const err = new Error('Item not found');
        err.status = 404;
        return next(err)
    }

    res.render('itemInstance_detail', {
        title: 'Item:',
        iteminstance: itemInstance,
    })
});

exports.itemInstance_create_get = asyncHandler(async (req, res, next) => {
    const allItems = await Item.find({}, 'name').sort({ name: 1 }).exec();

    res.render('iteminstance_form', {
        title: 'Create ItemInstance',
        item_list: allItems,
        iteminstance: new ItemInstance(),
    })
});

exports.itemInstance_create_post = [
    body('item', "Item must be specified")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('stock', 'Stock must be a number and at least 0')
        .isNumeric().withMessage('Stock must be a number')
        .isInt({ min: 0 }).withMessage('Stock must be at least 0')
        .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const itemInstance = new ItemInstance({
            item: req.body.item,
            stock: req.body.stock,
        })

        if (!errors.isEmpty()){
            const allItems = await Item.find({}, 'name').sort({ name: 1 }).exec()

            res.render('iteminstance_form', {
                title: 'Create ItemInstance',
                item_list: allItems,
                selected_item: itemInstance.item._id,
                errors: errors.array(),
                iteminstances: itemInstance
            })
            
            // return
        } else{
            await itemInstance.save();
            res.redirect(itemInstance.url)
        }
    })
]

exports.itemInstance_delete_get = asyncHandler(async (req, res, next) => {
    const itemInstance = await Promise.all([
        ItemInstance.findById(req.params.id).exec(),
    ])

    if ( itemInstance === null ){
        res.redirect('/catalog/item-instances');
    }

    res.render('itemInstance_delete', {
        title: 'Delete Item Instance',
        itemInstance: itemInstance,
        stock: itemInstance.stock,
    })
    
});

exports.itemInstance_delete_post = asyncHandler(async (req, res, next) => {
    const itemInstance = await ItemInstance.findById(req.params.id).exec();

    if (!itemInstance) {
        // Handle case where itemInstance is not found
        return res.redirect('/catalog/item-instances');
    }

    await ItemInstance.findByIdAndDelete(req.params.id);
    res.redirect('/catalog/item-instances');
});

exports.itemInstance_update_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Item Instance update GET");
});

exports.itemInstance_update_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Item Instance update POST");
});
