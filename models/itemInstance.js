const mongoose= require('mongoose');

const Schema= mongoose.Schema;

const ItemInstanceSchema= new Schema({
    item: { type: Schema.Types.ObjectId, ref: "Item", required: true},
    stock: {
         type: Number,
         min: 0,
         max: 35,
         validate: {
            validator: function(value) {
                return (value >= 0 && value <= 35);
            },
            message: 'Stock must be between 0 and 35'
        },
         required: true
        }
})

ItemInstanceSchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the this object
    return `/catalog/item-Instances/${this._id}`;
  });

ItemInstanceSchema.virtual("stockStatus").get(function () {
    if (this.stock === 0) {
        return 'no-stock';
    } else if (this.stock >= 1 && this.stock <= 25) {
        return 'restock';
    } else {
        return 'full-stock';
    }
});

  module.exports = mongoose.model("ItemInstance", ItemInstanceSchema); 