const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var cartSchema = new Schema({
    user:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    products:  [{
        name: {
        	type: String,
        	required: true
        },
        description: {
        	type: String,
        	required: true
        },
        size: {
        	type: String,
        	required: true
        },
        quantity: {
        	type: Number,
        	required: true
        },
        price: {
        	type: Number,
        	required: true
        }
    }],
    delivered: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});

var Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;