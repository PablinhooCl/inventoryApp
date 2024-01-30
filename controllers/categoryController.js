const mongoose = require('mongoose');
const Item = require('../models/item');
const Category = require('../models/category');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require("express-validator");
const { response } = require('express');


exports.category_list = asyncHandler(async( req, res, next ) => {
    const AllCategories = await Category.find().sort({name: 1}).exec()
    res.render('category_list', {
        title: "Category List",
        category_list: AllCategories
    });
});

exports.category_detail = asyncHandler(async( req, res, next) => {
    try {
        console.log("Entering category_detail route handler");
        
        const categoryId = req.params.id;
        console.log("Category ID:", categoryId);

        const category = await Category.findById(categoryId).exec();    
        console.log("Retrieved category from the database:", category);

        const itemsInCategory = await Item.find({ category: categoryId }, "name price").exec();
        console.log("Retrieved items in the category from the database:", itemsInCategory);

        if (!category) {
            const err = new Error('Category not found');
            err.status = 404;
            throw err;
        }

        console.log("Rendering category_detail view");
        res.render('category_detail', {
            title: 'Category Detail',
            category: category,
            category_items: itemsInCategory,
        });
    } catch (error) {
        console.error("Error in category_detail route handler:", error);
        next(error);
    }
});

exports.category_create_get = asyncHandler(async (req, res, next) => {
    res.render('category_form', {
        title: 'Create Category',
        categories: new Category(),
    });
});

exports.category_create_post = [
    // Validar los campos del formulario
    body('name', 'Category needs to be at least 3 characters')
        .trim()
        .isLength({ min: 3 })
        .escape(),

    // Manejar la validación de errores
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const category = new Category({ name: req.body.name })
        // Si hay errores, renderizar el formulario con los errores
        if (!errors.isEmpty()) {
            res.render('category_form', {
                title: 'Create Category',
                categories: category,
                errors: errors.array(),
            });
        } else {
            // Si no hay errores, intentar crear la categoría
                const categoryExists = await Category.findOne({ name: req.body.name })
                    .collation({ locale: 'en', strength: 2 })
                    .exec();

                if (categoryExists) {
                    // La categoría ya existe, redirigir a su URL
                    res.redirect(categoryExists.url);
                } else {
                    // La categoría no existe, crearla y redirigir a su URL
                    await category.save();
                    res.redirect(category.url);
                }
            } 
        }
    )
]
exports.category_delete_get = asyncHandler(async (req, res, next) => {
    const [category, allItemsByCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({ category: req.params.id }, 'name').exec(),
    ])

    if (category === null){
        res.redirect('/catalog/items')
    }

    res.render('category_delete', {
        title: 'Delete Category',
        category: category,
        category_items: allItemsByCategory,
    })
});

exports.category_delete_post = asyncHandler(async (req, res, next) => {
    const [category, allItemsByCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({ category: req.params.id }, 'name').exec(),
    ])
    
    if (allItemsByCategory.length > 0){
        res.render('category_delete', {
            title: 'Delete Category',
            category: category,
            category_items: allItemsByCategory,
        })
        return
    } else {
        await Category.findByIdAndDelete(req.body.categoryid);
        res.redirect('/catalog/categories')
    }
});
  
exports.category_update_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Category update GET");
});
  
exports.category_update_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Category update POST");
});