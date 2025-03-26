const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    walletAddress: {
        type: String,
        required: false,
        unique: true,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true; // Skip validation if empty (since it's not required)
                return /^0x[a-fA-F0-9]{40}$/.test(v);
            },
            message: props => `${props.value} is not a valid Ethereum wallet address!`
        }
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true,
    collection: 'users'
});


const User = mongoose.model('user', userSchema);

module.exports = User;