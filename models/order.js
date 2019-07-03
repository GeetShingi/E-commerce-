const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var orderSchema = new Schema({
    user:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    orders:  [{
    	products: [{
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
    	}
    }],
}, {
    timestamps: true
});
var Order = mongoose.model('Order', orderSchema);
module.exports = Order;