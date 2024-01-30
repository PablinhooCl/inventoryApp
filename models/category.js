const mongoose= require('mongoose');

const Schema= mongoose.Schema;

const categorySchema= new Schema({
    name: { 
        type: String,
        minLength: 3,
        maxLength: 100,
        required: true
    }
})

categorySchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the this object
    return `/catalog/categories/${this._id}`;
  });

  module.exports = mongoose.model("Category", categorySchema);