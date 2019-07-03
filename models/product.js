const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var commentSchema = new Schema({
    rating:  {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment:  {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});
const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
     price: {
        type: String,
        required: true,
        min: 0
    },
     image: {
         type: [String],
         required: true
     },
     xsmall: {
        type: Number,
        required: true
    },
    small: {
        type: Number,
        required: true
    },
    medium: {
        type: Number,
        required: true
    },
    large: {
        type: Number,
        required: true
    },
    xlarge: {
        type: Number,
        required: true
    },
    xxlarge: {
        type: Number,
        required: true
    },
    xxxlarge: {
        type: Number,
        required: true
    },
    comments:[commentSchema]
}, {
    timestamps: true
});

var Products = mongoose.model('Product', productSchema);

module.exports = Products;
