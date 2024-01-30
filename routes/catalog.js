var express = require('express');
var router = express.Router();

const item_controller = require('../controllers/itemController');
const itemInstance_controller = require('../controllers/itemInstanceController');
const category_controller = require('../controllers/categoryController');

router.get("/", item_controller.index);

router.get('/items', item_controller.item_list);
router.get('/items/create', item_controller.item_create_get);
router.post('/items/create', item_controller.item_create_post);

router.get('/items/:id/delete', item_controller.item_delete_get);
router.post('/items/:id/delete', item_controller.item_delete_post);
router.get('/items/:id/update', item_controller.item_update_get);
router.post('/items/:id/update', item_controller.item_update_post);
router.get('/items/:id', item_controller.item_detail);


// ItemInstance routes
router.get('/item-instances', itemInstance_controller.itemInstance_list);
router.get('/item-instances/create', itemInstance_controller.itemInstance_create_get);
router.post('/item-instances/create', itemInstance_controller.itemInstance_create_post);

router.get('/item-instances/:id/delete', itemInstance_controller.itemInstance_delete_get);
router.post('/item-instances/:id/delete', itemInstance_controller.itemInstance_delete_post);
router.get('/item-instances/:id/update', itemInstance_controller.itemInstance_update_get);
router.post('/item-instances/:id/update', itemInstance_controller.itemInstance_update_post);
router.get('/item-instances/:id', itemInstance_controller.itemInstance_detail);


// Category routes
router.get('/categories', category_controller.category_list);
router.get('/categories/create', category_controller.category_create_get);
router.post('/categories/create', category_controller.category_create_post);

router.get('/categories/:id/delete', category_controller.category_delete_get);
router.post('/categories/:id/delete', category_controller.category_delete_post);
router.get('/categories/:id/update', category_controller.category_update_get);
router.post('/categories/:id/update', category_controller.category_update_post);
router.get('/categories/:id', category_controller.category_detail);


module.exports = router;