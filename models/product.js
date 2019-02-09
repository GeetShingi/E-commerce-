const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;
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
        type: Currency,
        required: true,
        min: 0
    },
//     image: {
//         type: String,
//         required: true
//     },
//     category: {
//         type: String,
//         required: true
//     },
//     label: {
//         type: String,
//         default: ''
//     },
//     featured: {
//         type: Boolean,
//         default:false      
//     },
//     comments:[commentSchema]
// }, {
//     timestamps: true
});

var Products = mongoose.model('Product', productSchema);

module.exports = Products;