const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true }, 
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true }, 
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Picked Up', 'On the Way', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  restaurantLocation: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true } 
  },
  customerLocation: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true } 
  },
  currentLocation: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] } 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

deliverySchema.index({ restaurantLocation: '2dsphere' });
deliverySchema.index({ customerLocation: '2dsphere' });

module.exports = mongoose.model('Delivery', deliverySchema);
