    const mongoose= require('mongoose');

    const Schema= mongoose.Schema;
    
    const ItemSchema= new Schema({
        name: { type: String, required: true},
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true},
        price: { 
            type: Number,
            validate:{
                validator: function(value){
                    return /^(\d*\.)?\d{2}$/.test(value.toString());
                },
                message: props => `${props.value} no tiene exactamente dos decimales`
            },
            min: 0,
            required: true},
            images: {
                type: [{
                    type: String,
                    validate: {
                        validator: function (value) {
                            return /^\/uploads\/.+\.jpg$/.test(value);
                        },
                        message: props => `${props.value} no es una ruta de imagen válida`
                    }
                }],
                validate: {
                    validator: function (value) {
                        return value.length <= 5;
                    },
                    message: 'No se permiten más de 5 imágenes'
                }
            }
    })

    ItemSchema.virtual("url").get(function () {
        // We don't use an arrow function as we'll need the this object
        return `/catalog/items/${this._id}`;
      });
    
      module.exports = mongoose.model("Item", ItemSchema);