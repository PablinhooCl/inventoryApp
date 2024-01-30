#! /usr/bin/env node

console.log(
    'This script populates some test items, item instances, and categories to your database. Specify the database as an argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_catalog?retryWrites=true&w=majority"'
  );
  
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  
  const Item = require("./models/item");
  const ItemInstance = require("./models/itemInstance");
  const Category = require("./models/category");
  
  const items = [];
  const itemInstances = [];
  const categories = [];
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false);
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createCategories();
    await createItems();
    await createItemInstances();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  
  async function categoryCreate(name) {
    const category = new Category({ name: name });
    await category.save();
    categories.push(category);
    console.log(`Added category: ${name}`);
  }
  
  async function itemCreate(name, category, price) {
    const itemDetail = {
      name: name,
      category: category,
      price: price,
    };
  
    const item = new Item(itemDetail);
    await item.save();
    items.push(item);
    console.log(`Added item: ${name}`);
  }
  
  async function itemInstanceCreate(item, stock, url) {
    const itemInstanceDetail = {
      item: item,
      stock: stock,
      url: url,
    };
  
    const itemInstance = new ItemInstance(itemInstanceDetail);
    await itemInstance.save();
    itemInstances.push(itemInstance);
    console.log(`Added item instance for ${item.name}`);
  }
  
  async function createCategories() {
    console.log("Adding categories");
    await Promise.all([
      categoryCreate("AMD Processors"),
      categoryCreate("NVIDIA Graphics Cards"),
      categoryCreate("RAM"),
    ]);
  }
  
  async function createItems() {
    console.log("Adding items");
    await Promise.all([
        itemCreate("AMD Ryzen 5 5600X", categories[0], 299.99),
        itemCreate("NVIDIA GeForce RTX 3080", categories[1], 699.99),
        itemCreate("Corsair Vengeance LPX 16GB", categories[2], 79.99),
        itemCreate("AMD Ryzen 7 5800X", categories[0], 449.99),
        itemCreate("NVIDIA GeForce RTX 3070", categories[1], 499.99),
        itemCreate("G.Skill Ripjaws V 32GB", categories[2], 149.99),
        itemCreate("AMD Ryzen 9 5900X", categories[0], 649.99),
        itemCreate("NVIDIA GeForce GTX 1660 Super", categories[1], 299.99),
        itemCreate("Crucial Ballistix 16GB", categories[2], 69.99),
        itemCreate("AMD Ryzen 3 3300X", categories[0], 129.99),
        itemCreate("NVIDIA Quadro P4000", categories[1], 799.99),
        itemCreate("Kingston HyperX Fury 8GB", categories[2], 49.99),
      // Add more items as needed
    ]);
  }
  
  async function createItemInstances() {
    console.log("Adding item instances");
    await Promise.all([
        itemInstanceCreate(items[0], 10, "https://example.com/amd-ryzen-5600x"),
        itemInstanceCreate(items[1], 5, "https://example.com/nvidia-rtx-3080"),
        itemInstanceCreate(items[2], 20, "https://example.com/corsair-vengeance-16gb"),
        itemInstanceCreate(items[3], 15, "https://example.com/amd-ryzen-5800x"),
        itemInstanceCreate(items[4], 8, "https://example.com/nvidia-rtx-3070"),
        itemInstanceCreate(items[5], 25, "https://example.com/gskill-ripjaws-32gb"),
        itemInstanceCreate(items[6], 12, "https://example.com/amd-ryzen-5900x"),
        itemInstanceCreate(items[7], 7, "https://example.com/nvidia-gtx-1660-super"),
        itemInstanceCreate(items[8], 30, "https://example.com/crucial-ballistix-16gb"),
        itemInstanceCreate(items[9], 18, "https://example.com/amd-ryzen-3300x"),
        itemInstanceCreate(items[10], 3, "https://example.com/nvidia-quadro-p4000"),
        itemInstanceCreate(items[11], 22, "https://example.com/kingston-hyperx-8gb"),
      // Add more item instances as needed
    ]);
  }